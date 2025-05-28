import cv2
import numpy as np
import face_recognition
import os
import glob
import pandas as pd
import json
from datetime import datetime, timedelta
import threading
import tkinter as tk
from tkinter import filedialog, messagebox

CONFIG_FILE = 'attendance_config.json'
STATE_FILE = 'attendance_state.json'

class EnhancedFaceRecognition:
    def __init__(self, confidence_threshold=0.6):
        self.known_face_encodings = []
        self.known_face_names = []
        self.confidence_threshold = confidence_threshold

    def load_encoding_images(self, images_path):
        """Load face encodings and names."""
        self.known_face_encodings.clear()
        self.known_face_names.clear()
        for img_path in glob.glob(os.path.join(images_path, "*.*")):
            img = cv2.imread(img_path)
            if img is None:
                continue
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encs = face_recognition.face_encodings(rgb)
            if not encs:
                continue
            name = os.path.splitext(os.path.basename(img_path))[0]
            self.known_face_encodings.append(encs[0])
            self.known_face_names.append(name)

    def detect_and_mark(self, frame, attendance_df):
        """Detect faces and append new names to attendance_df."""
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        locs = face_recognition.face_locations(rgb)
        encs = face_recognition.face_encodings(rgb, locs)

        for loc, enc in zip(locs, encs):
            dists = face_recognition.face_distance(self.known_face_encodings, enc)
            if len(dists) == 0:
                continue
            best = np.argmin(dists)
            conf = 1 - dists[best]
            name = self.known_face_names[best] if conf >= self.confidence_threshold else None

            if name and name not in attendance_df['Name'].values:
                timestamp = datetime.now().strftime('%Y-%m-%d %I:%M:%S %p')
                attendance_df.loc[len(attendance_df)] = [name, timestamp]

            label = f"{name} (OK)" if name and name in attendance_df['Name'].values else 'Unknown'
            y1, x2, y2, x1 = loc
            color = (0,255,0) if name else (0,0,255)
            cv2.rectangle(frame, (x1,y1),(x2,y2), color, 2)
            cv2.putText(frame, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
        return frame

class AttendanceApp:
    def __init__(self, master):
        self.master = master
        master.title('Face Attendance App')

        # Load saved folder if exists
        self.folder = None
        if os.path.exists(CONFIG_FILE):
            try:
                cfg = json.load(open(CONFIG_FILE))
                if 'folder' in cfg and os.path.isdir(cfg['folder']):
                    self.folder = cfg['folder']
            except:
                pass

        self.sfr = EnhancedFaceRecognition()
        self.record_interval = timedelta(minutes=5)
        self.interval_start = None
        self.next_rotate = None
        self.current_file = None
        self.attendance_df = pd.DataFrame(columns=['Name', 'Time'])

        # UI Buttons
        tk.Button(master, text='Select Folder', command=self.select_folder).pack(pady=5)
        tk.Button(master, text='Start', command=self.start).pack(pady=5)
        tk.Button(master, text='Stop', command=self.stop).pack(pady=5)

        self.running = False
        self.cap = None

    def select_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.folder = folder
            with open(CONFIG_FILE, 'w') as f:
                json.dump({'folder': self.folder}, f)
            messagebox.showinfo('Selected', f'Images folder set to: {self.folder}')

    def compute_interval_start(self, now):
        minute = (now.minute // 5) * 5
        return now.replace(minute=minute, second=0, microsecond=0)

    def make_filename(self, dt):
        return dt.strftime('attendance_%Y%m%d_%I%M_%p.xlsx')

    def load_state(self):
        """Load JSON state if current interval matches, else reset."""
        now = datetime.now()
        current_interval = self.compute_interval_start(now).strftime('%Y%m%d_%I%M_%p')
        if os.path.exists(STATE_FILE):
            try:
                state = json.load(open(STATE_FILE))
                if state.get('interval') == current_interval:
                    return pd.DataFrame(state.get('records', []))
            except:
                pass
        # No valid state: start fresh
        return pd.DataFrame(columns=['Name', 'Time'])

    def save_state(self):
        """Persist JSON state including interval."""
        state = {
            'interval': self.interval_start.strftime('%Y%m%d_%I%M_%p'),
            'records': self.attendance_df.to_dict(orient='records')
        }
        with open(STATE_FILE, 'w') as f:
            json.dump(state, f)

    def start(self):
        if not self.folder:
            messagebox.showwarning('Error', 'Select the images folder first.')
            return
        if self.running:
            messagebox.showinfo('Info', 'Already running.')
            return

        # Load face encodings
        self.sfr.load_encoding_images(self.folder)

        # Determine file path and interval
        now = datetime.now()
        self.interval_start = self.compute_interval_start(now)
        self.current_file = os.path.join(self.folder, self.make_filename(self.interval_start))

        # Load or init attendance DataFrame and JSON state
        self.attendance_df = self.load_state()
        if self.attendance_df.empty and os.path.exists(self.current_file):
            try:
                self.attendance_df = pd.read_excel(self.current_file)
            except:
                self.attendance_df = pd.read_csv(self.current_file.replace('.xlsx','.csv'))

        self.next_rotate = self.interval_start + self.record_interval
        self.running = True
        self.cap = cv2.VideoCapture(0)
        threading.Thread(target=self.loop, daemon=True).start()
        messagebox.showinfo('Started', f'Logging to {self.current_file}')

    def loop(self):
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                break
            frame = cv2.flip(frame, 1)
            frame = self.sfr.detect_and_mark(frame, self.attendance_df)
            cv2.imshow('Attendance', frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                self.stop()
                break

            if datetime.now() >= self.next_rotate:
                self.save()
                self.interval_start = self.next_rotate
                self.current_file = os.path.join(self.folder, self.make_filename(self.interval_start))
                # Reset DataFrame and state for new interval
                self.attendance_df = pd.DataFrame(columns=['Name','Time'])
                self.next_rotate = self.interval_start + self.record_interval
        cv2.destroyAllWindows()

    def save(self):
        # Persist to Excel/CSV
        try:
            self.attendance_df.to_excel(self.current_file, index=False)
        except:
            self.attendance_df.to_csv(self.current_file.replace('.xlsx','.csv'), index=False)
        # Persist JSON state
        self.save_state()

    def stop(self):
        if not self.running:
            return
        self.running = False
        if self.cap:
            self.cap.release()
        self.save()
        messagebox.showinfo('Stopped', f'Saved to {self.current_file}')

if __name__ == '__main__':
    root = tk.Tk()
    app = AttendanceApp(root)
    root.mainloop()




# -------------------------
# Packaging to Windows .exe
# -------------------------
# To compile this script into a standalone .exe on Windows, use PyInstaller:
# 1. Install PyInstaller:
#       pip install pyinstaller
# 2. Run:
#       pyinstaller --onefile --windowed your_script_name.py
# 3. Find the .exe in 'dist' and distribute with the JSON files.
#
# -------------------------
# Packaging to macOS
# -------------------------
# On macOS, you can also use PyInstaller:
# 1. Install PyInstaller:
#       pip install pyinstaller
# 2. Run:
#       pyinstaller --onefile --windowed your_script_name.py
# 3. The executable will be in 'dist'.
# 4. Ensure you have the proper permissions (chmod +x) and include the JSON files.
#
# Alternatively, you can use py2app for a native .app bundle:
# 1. Install py2app:
#       pip install py2app
# 2. Create 'setup.py':
#       from setuptools import setup
#       APP = ['your_script_name.py']
#       OPTIONS = {'argv_emulation': True, 'packages': ['cv2','face_recognition','pandas']}
#       setup(app=APP, options={'py2app': OPTIONS}, setup_requires=['py2app'])
# 3. Run:
#       python setup.py py2app
# 4. The .app bundle will appear in 'dist'.
# 5. Distribute the .app alongside your JSON files.

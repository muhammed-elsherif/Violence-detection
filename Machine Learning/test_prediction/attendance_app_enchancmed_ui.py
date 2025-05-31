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
from tkinter import ttk, filedialog, messagebox
import schedule
import time

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
        # grab all files in the folder (jpg/png/etc)
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
        master.geometry('800x600')
        
        # Main frame
        self.main_frame = ttk.Frame(master, padding="10")
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        style = ttk.Style()
        style.configure('TButton', padding=5)
        style.configure('TLabel', padding=5)
        
        # Load saved folder
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
        
        self.create_ui()
        
        self.running = False
        self.cap = None
        self.schedule_thread = None

    def create_ui(self):
        # Folder selector
        folder_frame = ttk.LabelFrame(self.main_frame, text="Image Folder", padding="5")
        folder_frame.pack(fill=tk.X, pady=5)
        
        self.folder_label = ttk.Label(folder_frame, text=self.folder or "No folder selected")
        self.folder_label.pack(side=tk.LEFT, padx=5)
        ttk.Button(folder_frame, text='Select Folder', command=self.select_folder).pack(side=tk.RIGHT, padx=5)

        # Schedule settings
        schedule_frame = ttk.LabelFrame(self.main_frame, text="Schedule Settings", padding="5")
        schedule_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(schedule_frame, text="Start Time:").grid(row=0, column=0, padx=5, pady=5)
        self.start_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
        self.start_hour.grid(row=0, column=1, padx=5, pady=5)
        self.start_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
        self.start_minute.grid(row=0, column=2, padx=5, pady=5)
        
        ttk.Label(schedule_frame, text="End Time:").grid(row=1, column=0, padx=5, pady=5)
        self.end_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
        self.end_hour.grid(row=1, column=1, padx=5, pady=5)
        self.end_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
        self.end_minute.grid(row=1, column=2, padx=5, pady=5)
        
        # Controls
        control_frame = ttk.Frame(self.main_frame)
        control_frame.pack(fill=tk.X, pady=10)
        
        self.start_button = ttk.Button(control_frame, text='Start Now', command=self.start)
        self.start_button.pack(side=tk.LEFT, padx=5)
        
        self.schedule_button = ttk.Button(control_frame, text='Schedule', command=self.schedule_attendance)
        self.schedule_button.pack(side=tk.LEFT, padx=5)
        
        self.stop_button = ttk.Button(control_frame, text='Stop', command=self.stop)
        self.stop_button.pack(side=tk.LEFT, padx=5)
        
        # Status & Summary
        self.status_label = ttk.Label(self.main_frame, text="Status: Not Running")
        self.status_label.pack(pady=5)
        
        summary_frame = ttk.LabelFrame(self.main_frame, text="Attendance Summary", padding="5")
        summary_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.summary_text = tk.Text(summary_frame, height=10, width=50)
        self.summary_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    def select_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.folder = folder
            self.folder_label.config(text=folder)
            with open(CONFIG_FILE, 'w') as f:
                json.dump({'folder': self.folder}, f)
            messagebox.showinfo('Selected', f'Images folder set to: {self.folder}')

    def schedule_attendance(self):
        if not self.folder:
            messagebox.showwarning('Error', 'Select the images folder first.')
            return

        try:
            # parse and zero-pad hours and minutes
            sh = int(self.start_hour.get())
            sm = int(self.start_minute.get())
            eh = int(self.end_hour.get())
            em = int(self.end_minute.get())

            start_time = f"{sh:02d}:{sm:02d}"
            end_time   = f"{eh:02d}:{em:02d}"

            # now these are always valid "HH:MM"
            schedule.every().day.at(start_time).do(self.start)
            schedule.every().day.at(end_time).do(self.stop)

            if not (self.schedule_thread and self.schedule_thread.is_alive()):
                self.schedule_thread = threading.Thread(target=self.run_schedule, daemon=True)
                self.schedule_thread.start()

            messagebox.showinfo('Scheduled', f'Runs daily from {start_time} to {end_time}.')
        except ValueError:
            messagebox.showerror('Error', 'Invalid hour or minute—please enter numbers between 0 and 23 for hours and 0 and 59 for minutes.')

    def run_schedule(self):
        while True:
            schedule.run_pending()
            time.sleep(1)

    def update_status(self, status):
        self.status_label.config(text=f"Status: {status}")

    def compute_interval_start(self, now):
        minute = (now.minute // 5) * 5
        return now.replace(minute=minute, second=0, microsecond=0)

    def make_filename(self, dt):
        return dt.strftime('attendance_%Y%m%d_%I%M_%p.xlsx')

    def load_state(self):
        now = datetime.now()
        interval = self.compute_interval_start(now).strftime('%Y%m%d_%I%M_%p')
        if os.path.exists(STATE_FILE):
            try:
                st = json.load(open(STATE_FILE))
                if st.get('interval') == interval:
                    return pd.DataFrame(st.get('records', []))
            except:
                pass
        return pd.DataFrame(columns=['Name','Time'])

    def save_state(self):
        state = {
            'interval': self.interval_start.strftime('%Y%m%d_%I%M_%p'),
            'records': self.attendance_df.to_dict(orient='records')
        }
        json.dump(state, open(STATE_FILE, 'w'))

    def start(self):
        if not self.folder:
            messagebox.showwarning('Error', 'Select the images folder first.')
            return
        if self.running:
            messagebox.showinfo('Info', 'Already running.')
            return

        self.sfr.load_encoding_images(self.folder)
        now = datetime.now()
        self.interval_start = self.compute_interval_start(now)
        self.current_file = os.path.join(self.folder, self.make_filename(self.interval_start))

        self.attendance_df = self.load_state()
        if self.attendance_df.empty and os.path.exists(self.current_file):
            try:
                self.attendance_df = pd.read_excel(self.current_file)
            except:
                self.attendance_df = pd.read_csv(self.current_file.replace('.xlsx','.csv'))

        self.next_rotate = self.interval_start + self.record_interval
        self.running = True
        self.cap = cv2.VideoCapture(0)
        self.update_status("Running")
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
                self.attendance_df = pd.DataFrame(columns=['Name','Time'])
                self.next_rotate = self.interval_start + self.record_interval

        cv2.destroyAllWindows()

    def save(self):
        try:
            self.attendance_df.to_excel(self.current_file, index=False)
        except:
            self.attendance_df.to_csv(self.current_file.replace('.xlsx','.csv'), index=False)
        self.save_state()

    def stop(self):
        if not self.running:
            return
        self.running = False
        if self.cap:
            self.cap.release()
        self.save()
        self.update_status("Stopped")
        summary = self.show_attendance_summary()
        self.summary_text.delete(1.0, tk.END)
        self.summary_text.insert(tk.END, summary)
        messagebox.showinfo('Stopped', f'Saved to {self.current_file}\n\n{summary}')

    def show_attendance_summary(self):
        if self.attendance_df.empty:
            return "No attendance records found."

        summary = "=== Attendance Summary ===\n\n"
        known = set(self.sfr.known_face_names)
        present = set(self.attendance_df['Name'])
        absent = known - present

        summary += "Present:\n"
        for name in sorted(present):
            first = self.attendance_df[self.attendance_df['Name']==name]['Time'].min()
            summary += f"- {name} (First seen: {first})\n"

        summary += "\nAbsent:\n"
        for name in sorted(absent):
            summary += f"- {name}\n"

        return summary

if __name__ == '__main__':
    root = tk.Tk()
    app = AttendanceApp(root)
    root.mainloop()

# # # # import cv2
# # # # import numpy as np
# # # # import face_recognition
# # # # import os
# # # # import glob
# # # # import pandas as pd
# # # # import json
# # # # from datetime import datetime, timedelta
# # # # import threading
# # # # import tkinter as tk
# # # # from tkinter import ttk, filedialog, messagebox, simpledialog
# # # # import schedule
# # # # import time

# # # # CONFIG_FILE = 'attendance_config.json'
# # # # STATE_FILE = 'attendance_state.json'
# # # # ADMIN_PASSWORD = 'admin'

# # # # class EnhancedFaceRecognition:
# # # #     def __init__(self, confidence_threshold=0.6):
# # # #         self.known_face_encodings = []
# # # #         self.known_face_names = []
# # # #         self.confidence_threshold = confidence_threshold

# # # #     def load_encoding_images(self, images_path):
# # # #         """Load face encodings and names."""
# # # #         self.known_face_encodings.clear()
# # # #         self.known_face_names.clear()
# # # #         for img_path in glob.glob(os.path.join(images_path, "*.*")):
# # # #             img = cv2.imread(img_path)
# # # #             if img is None:
# # # #                 continue
# # # #             rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
# # # #             encs = face_recognition.face_encodings(rgb)
# # # #             if not encs:
# # # #                 continue
# # # #             name = os.path.splitext(os.path.basename(img_path))[0]
# # # #             self.known_face_encodings.append(encs[0])
# # # #             self.known_face_names.append(name)

# # # #     def detect_and_mark(self, frame, attendance_df):
# # # #         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
# # # #         locs = face_recognition.face_locations(rgb)
# # # #         encs = face_recognition.face_encodings(rgb, locs)

# # # #         for loc, enc in zip(locs, encs):
# # # #             dists = face_recognition.face_distance(self.known_face_encodings, enc)
# # # #             if len(dists) == 0:
# # # #                 continue
# # # #             best = np.argmin(dists)
# # # #             conf = 1 - dists[best]
# # # #             name = self.known_face_names[best] if conf >= self.confidence_threshold else None

# # # #             if name and 'Name' in attendance_df.columns and name not in attendance_df['Name'].values:
# # # #                 timestamp = datetime.now().strftime('%Y-%m-%d %I:%M:%S %p')
# # # #                 attendance_df.loc[len(attendance_df)] = [name, timestamp]

# # # #             label = f"{name} (OK)" if name else 'Unknown'
# # # #             y1, x2, y2, x1 = loc
# # # #             color = (0,255,0) if name else (0,0,255)
# # # #             cv2.rectangle(frame, (x1,y1),(x2,y2), color, 2)
# # # #             cv2.putText(frame, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
# # # #         return frame

# # # # class AttendanceApp:
# # # #     def __init__(self, master):
# # # #         self.master = master
# # # #         # hide main window for auth
# # # #         self.master.withdraw()
# # # #         self.authenticate()
# # # #         # show after auth
# # # #         self.master.deiconify()

# # # #         master.title('Face Attendance App')
# # # #         master.geometry('800x600')

# # # #         self.main_frame = ttk.Frame(master, padding="10")
# # # #         self.main_frame.pack(fill=tk.BOTH, expand=True)
        
# # # #         style = ttk.Style()
# # # #         style.configure('TButton', padding=5)
# # # #         style.configure('TLabel', padding=5)
        
# # # #         self.folder = None
# # # #         if os.path.exists(CONFIG_FILE):
# # # #             try:
# # # #                 cfg = json.load(open(CONFIG_FILE))
# # # #                 if 'folder' in cfg and os.path.isdir(cfg['folder']):
# # # #                     self.folder = cfg['folder']
# # # #             except:
# # # #                 pass

# # # #         self.sfr = EnhancedFaceRecognition()
# # # #         self.record_interval = timedelta(minutes=5)
# # # #         self.interval_start = None
# # # #         self.next_rotate = None
# # # #         self.current_file = None
# # # #         self.attendance_df = pd.DataFrame(columns=['Name', 'Time'])
        
# # # #         self.create_ui()
# # # #         self.disable_controls()
        
# # # #         self.running = False
# # # #         self.cap = None
# # # #         self.schedule_thread = None

# # # #     def authenticate(self):
# # # #         pwd = simpledialog.askstring("Password", "Enter admin password:", show='*', parent=self.master)
# # # #         if pwd != ADMIN_PASSWORD:
# # # #             messagebox.showerror("Unauthorized", "Incorrect password. Exiting.", parent=self.master)
# # # #             self.master.destroy()
# # # #             exit()

# # # #     def create_ui(self):
# # # #         folder_frame = ttk.LabelFrame(self.main_frame, text="Image Folder", padding="5")
# # # #         folder_frame.pack(fill=tk.X, pady=5)
        
# # # #         self.folder_label = ttk.Label(folder_frame, text=self.folder or "No folder selected")
# # # #         self.folder_label.pack(side=tk.LEFT, padx=5)
# # # #         ttk.Button(folder_frame, text='Select Folder', command=self.select_folder).pack(side=tk.RIGHT, padx=5)

# # # #         schedule_frame = ttk.LabelFrame(self.main_frame, text="Schedule Settings", padding="5")
# # # #         schedule_frame.pack(fill=tk.X, pady=5)
        
# # # #         ttk.Label(schedule_frame, text="Start Time:").grid(row=0, column=0, padx=5, pady=5)
# # # #         self.start_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
# # # #         self.start_hour.grid(row=0, column=1, padx=5, pady=5)
# # # #         self.start_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
# # # #         self.start_minute.grid(row=0, column=2, padx=5, pady=5)
        
# # # #         ttk.Label(schedule_frame, text="End Time:").grid(row=1, column=0, padx=5, pady=5)
# # # #         self.end_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
# # # #         self.end_hour.grid(row=1, column=1, padx=5, pady=5)
# # # #         self.end_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
# # # #         self.end_minute.grid(row=1, column=2, padx=5, pady=5)
        
# # # #         control_frame = ttk.Frame(self.main_frame)
# # # #         control_frame.pack(fill=tk.X, pady=10)
        
# # # #         self.start_button = ttk.Button(control_frame, text='Start Now', command=self.start)
# # # #         self.start_button.pack(side=tk.LEFT, padx=5)
        
# # # #         self.schedule_button = ttk.Button(control_frame, text='Schedule', command=self.schedule_attendance)
# # # #         self.schedule_button.pack(side=tk.LEFT, padx=5)
        
# # # #         self.stop_button = ttk.Button(control_frame, text='Stop', command=self.stop)
# # # #         self.stop_button.pack(side=tk.LEFT, padx=5)
        
# # # #         self.status_label = ttk.Label(self.main_frame, text="Status: Not Running")
# # # #         self.status_label.pack(pady=5)

# # # #         summary_frame = ttk.LabelFrame(self.main_frame, text="Attendance Summary", padding="5")
# # # #         summary_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
# # # #         self.summary_text = tk.Text(summary_frame, height=10, width=50)
# # # #         self.summary_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

# # # #     def update_status(self, status):
# # # #         self.status_label.config(text=f"Status: {status}")

# # # #     def disable_controls(self):
# # # #         for widget in [self.start_hour, self.start_minute, self.end_hour, self.end_minute,
# # # #                        self.start_button, self.stop_button, self.schedule_button]:
# # # #             widget.config(state=tk.DISABLED)

# # # #     def enable_controls(self):
# # # #         for widget in [self.start_hour, self.start_minute, self.end_hour, self.end_minute,
# # # #                        self.start_button, self.stop_button, self.schedule_button]:
# # # #             widget.config(state=tk.NORMAL)

# # # #     def select_folder(self):
# # # #         folder = filedialog.askdirectory(parent=self.master)
# # # #         if folder:
# # # #             self.folder = folder
# # # #             self.folder_label.config(text=folder)
# # # #             json.dump({'folder': self.folder}, open(CONFIG_FILE,'w'))
# # # #             messagebox.showinfo('Selected', f'Images folder set to: {self.folder}', parent=self.master)
# # # #             self.enable_controls()

# # # #     def schedule_attendance(self):
# # # #         if not self.folder:
# # # #             messagebox.showwarning('Error', 'Select the images folder first.', parent=self.master)
# # # #             return
# # # #         try:
# # # #             sh, sm = int(self.start_hour.get()), int(self.start_minute.get())
# # # #             eh, em = int(self.end_hour.get()), int(self.end_minute.get())
# # # #             start_time = f"{sh:02d}:{sm:02d}"
# # # #             end_time   = f"{eh:02d}:{em:02d}"
# # # #             schedule.every().day.at(start_time).do(self.start)
# # # #             schedule.every().day.at(end_time).do(self.stop)
# # # #             if not (self.schedule_thread and self.schedule_thread.is_alive()):
# # # #                 self.schedule_thread = threading.Thread(target=self.run_schedule, daemon=True)
# # # #                 self.schedule_thread.start()
# # # #             for widget in [self.start_hour, self.start_minute, self.end_hour, self.end_minute,
# # # #                            self.start_button, self.stop_button, self.schedule_button]:
# # # #                 widget.config(state=tk.DISABLED)
# # # #             messagebox.showinfo('Scheduled', f'Runs daily from {start_time} to {end_time}.', parent=self.master)
# # # #         except ValueError:
# # # #             messagebox.showerror('Error', 'Enter valid numbers: 0-23 hours, 0-59 minutes.', parent=self.master)

# # # #     def run_schedule(self):
# # # #         while True:
# # # #             schedule.run_pending()
# # # #             time.sleep(1)

# # # #     def compute_interval_start(self, now):
# # # #         minute = (now.minute // 5) * 5
# # # #         return now.replace(minute=minute, second=0, microsecond=0)

# # # #     def make_filename(self, dt):
# # # #         return dt.strftime('attendance_%Y%m%d_%I%M_%p.xlsx')

# # # #     def load_state(self):
# # # #         now = datetime.now()
# # # #         interval = self.compute_interval_start(now).strftime('%Y%m%d_%I%M_%p')
# # # #         if os.path.exists(STATE_FILE):
# # # #             try:
# # # #                 st = json.load(open(STATE_FILE))
# # # #                 if st.get('interval') == interval:
# # # #                     df = pd.DataFrame(st.get('records', []))
# # # #                     df.columns = ['Name','Time']
# # # #                     return df
# # # #             except:
# # # #                 pass
# # # #         return pd.DataFrame(columns=['Name','Time'])

# # # #     def save_state(self):
# # # #         state = {
# # # #             'interval': self.interval_start.strftime('%Y%m%d_%I%M_%p'),
# # # #             'records': self.attendance_df.to_dict(orient='records')
# # # #         }
# # # #         json.dump(state, open(STATE_FILE,'w'))

# # # #     def start(self):
# # # #         if not self.folder:
# # # #             messagebox.showwarning('Error', 'Select the images folder first.', parent=self.master)
# # # #             return
# # # #         if self.running:
# # # #             messagebox.showinfo('Info', 'Already running.', parent=self.master)
# # # #             return

# # # #         self.sfr.load_encoding_images(self.folder)
# # # #         now = datetime.now()
# # # #         self.interval_start = self.compute_interval_start(now)
# # # #         self.current_file = os.path.join(self.folder, self.make_filename(self.interval_start))

# # # #         self.attendance_df = self.load_state()
# # # #         if self.attendance_df.empty and os.path.exists(self.current_file):
# # # #             try:
# # # #                 self.attendance_df = pd.read_excel(self.current_file)
# # # #             except:
# # # #                 self.attendance_df = pd.read_csv(self.current_file.replace('.xlsx','.csv'))
# # # #             if not self.attendance_df.empty:
# # # #                 self.attendance_df.columns = ['Name','Time']

# # # #         self.next_rotate = self.interval_start + self.record_interval
# # # #         self.running = True
# # # #         self.cap = cv2.VideoCapture(0)
# # # #         self.update_status("Running")
# # # #         threading.Thread(target=self.loop, daemon=True).start()
# # # #         messagebox.showinfo('Started', f'Logging to {self.current_file}', parent=self.master)

# # # #     def loop(self):
# # # #         while self.running:
# # # #             ret, frame = self.cap.read()
# # # #             if not ret:
# # # #                 break
# # # #             frame = cv2.flip(frame, 1)
# # # #             frame = self.sfr.detect_and_mark(frame, self.attendance_df)
# # # #             cv2.imshow('Attendance', frame)

# # # #             if cv2.waitKey(1) & 0xFF == ord('q'):
# # # #                 self.stop()
# # # #                 break

# # # #             if datetime.now() >= self.next_rotate:
# # # #                 self.save()
# # # #                 self.interval_start = self.next_rotate
# # # #                 self.current_file = os.path.join(self.folder, self.make_filename(self.interval_start))
# # # #                 self.attendance_df = pd.DataFrame(columns=['Name','Time'])
# # # #                 self.next_rotate = self.interval_start + self.record_interval
# # # #         cv2.destroyAllWindows()

# # # #     def save(self):
# # # #         try:
# # # #             self.attendance_df.to_excel(self.current_file, index=False)
# # # #         except:
# # # #             self.attendance_df.to_csv(self.current_file.replace('.xlsx','.csv'), index=False)
# # # #         self.save_state()

# # # #     def stop(self):
# # # #         if not self.running:
# # # #             return
# # # #         self.running = False
# # # #         if self.cap:
# # # #             self.cap.release()
# # # #         self.save()
# # # #         self.update_status("Stopped")
# # # #         summary = self.show_attendance_summary()
# # # #         self.summary_text.delete(1.0, tk.END)
# # # #         self.summary_text.insert(tk.END, summary)
# # # #         messagebox.showinfo('Stopped', f'Saved to {self.current_file}\n\n{summary}', parent=self.master)

# # # #     def show_attendance_summary(self):
# # # #         if self.attendance_df.empty:
# # # #             return "No attendance records found."

# # # #         summary = "=== Attendance Summary ===\n\n"
# # # #         known = set(self.sfr.known_face_names)
# # # #         present = set(self.attendance_df['Name'])
# # # #         absent = known - present

# # # #         summary += "Present:\n"
# # # #         for name in sorted(present):
# # # #             first = self.attendance_df[self.attendance_df['Name']==name]['Time'].min()
# # # #             summary += f"- {name} (First seen: {first})\n"

# # # #         summary += "\nAbsent:\n"
# # # #         for name in sorted(absent):
# # # #             summary += f"- {name}\n"

# # # #         return summary

# # # # if __name__ == '__main__':
# # # #     root = tk.Tk()
# # # #     app = AttendanceApp(root)
# # # #     root.mainloop()

  




# # # import cv2
# # # import numpy as np
# # # import face_recognition
# # # import os
# # # import glob
# # # import pandas as pd
# # # import json
# # # from datetime import datetime, timedelta
# # # import threading
# # # import tkinter as tk
# # # from tkinter import ttk, filedialog, messagebox, simpledialog
# # # import schedule
# # # import time

# # # CONFIG_FILE = 'attendance_config.json'
# # # STATE_FILE = 'attendance_state.json'
# # # ADMIN_PASSWORD = 'admin'

# # # class EnhancedFaceRecognition:
# # #     def __init__(self, confidence_threshold=0.6):
# # #         self.known_face_encodings = []
# # #         self.known_face_names = []
# # #         self.confidence_threshold = confidence_threshold

# # #     def load_encoding_images(self, images_path):
# # #         self.known_face_encodings.clear()
# # #         self.known_face_names.clear()
# # #         for img_path in glob.glob(os.path.join(images_path, "*.*")):
# # #             img = cv2.imread(img_path)
# # #             if img is None:
# # #                 continue
# # #             rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
# # #             encs = face_recognition.face_encodings(rgb)
# # #             if not encs:
# # #                 continue
# # #             name = os.path.splitext(os.path.basename(img_path))[0]
# # #             self.known_face_encodings.append(encs[0])
# # #             self.known_face_names.append(name)

# # #     def detect_and_mark(self, frame, attendance_df):
# # #         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
# # #         locs = face_recognition.face_locations(rgb)
# # #         encs = face_recognition.face_encodings(rgb, locs)
# # #         for loc, enc in zip(locs, encs):
# # #             dists = face_recognition.face_distance(self.known_face_encodings, enc)
# # #             if len(dists) == 0:
# # #                 continue
# # #             best = np.argmin(dists)
# # #             conf = 1 - dists[best]
# # #             name = self.known_face_names[best] if conf >= self.confidence_threshold else None
# # #             if name and 'Name' in attendance_df.columns and name not in attendance_df['Name'].values:
# # #                 timestamp = datetime.now().strftime('%Y-%m-%d %I:%M:%S %p')
# # #                 attendance_df.loc[len(attendance_df)] = [name, timestamp]
# # #             label = f"{name} (OK)" if name else 'Unknown'
# # #             y1, x2, y2, x1 = loc
# # #             color = (0,255,0) if name else (0,0,255)
# # #             cv2.rectangle(frame, (x1,y1),(x2,y2), color, 2)
# # #             cv2.putText(frame, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
# # #         return frame

# # # class AttendanceApp:
# # #     def __init__(self, master):
# # #         self.master = master
# # #         master.title('Face Attendance App')
# # #         master.geometry('800x600')

# # #         self.main_frame = ttk.Frame(master, padding="10")
# # #         self.main_frame.pack(fill=tk.BOTH, expand=True)
# # #         style = ttk.Style()
# # #         style.configure('TButton', padding=5)
# # #         style.configure('TLabel', padding=5)

# # #         self.folder = None
# # #         if os.path.exists(CONFIG_FILE):
# # #             try:
# # #                 cfg = json.load(open(CONFIG_FILE))
# # #                 if 'folder' in cfg and os.path.isdir(cfg['folder']):
# # #                     self.folder = cfg['folder']
# # #             except:
# # #                 pass

# # #         self.sfr = EnhancedFaceRecognition()
# # #         self.record_interval = timedelta(minutes=5)
# # #         self.interval_start = None
# # #         self.next_rotate = None
# # #         self.current_file = None
# # #         self.attendance_df = pd.DataFrame(columns=['Name', 'Time'])

# # #         self.create_ui()
# # #         self.disable_controls()

# # #         self.running = False
# # #         self.cap = None
# # #         self.schedule_thread = None

# # #     def create_ui(self):
# # #         # Folder selection
# # #         folder_frame = ttk.LabelFrame(self.main_frame, text="Image Folder", padding="5")
# # #         folder_frame.pack(fill=tk.X, pady=5)
# # #         self.folder_label = ttk.Label(folder_frame, text=self.folder or "No folder selected")
# # #         self.folder_label.pack(side=tk.LEFT, padx=5)
# # #         ttk.Button(folder_frame, text='Select Folder', command=self.select_folder).pack(side=tk.RIGHT, padx=5)

# # #         # Password button
# # #         pass_frame = ttk.Frame(self.main_frame)
# # #         pass_frame.pack(fill=tk.X, pady=5)
# # #         ttk.Button(pass_frame, text='Enter Password', command=self.check_password).pack(side=tk.LEFT, padx=5)

# # #         # Schedule Settings
# # #         schedule_frame = ttk.LabelFrame(self.main_frame, text="Schedule Settings", padding="5")
# # #         schedule_frame.pack(fill=tk.X, pady=5)
# # #         ttk.Label(schedule_frame, text="Start Time:").grid(row=0, column=0, padx=5, pady=5)
# # #         self.start_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
# # #         self.start_hour.grid(row=0, column=1, padx=5)
# # #         self.start_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
# # #         self.start_minute.grid(row=0, column=2, padx=5)
# # #         ttk.Label(schedule_frame, text="End Time:").grid(row=1, column=0, padx=5, pady=5)
# # #         self.end_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
# # #         self.end_hour.grid(row=1, column=1, padx=5)
# # #         self.end_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
# # #         self.end_minute.grid(row=1, column=2, padx=5)

# # #         # Control buttons
# # #         control_frame = ttk.Frame(self.main_frame)
# # #         control_frame.pack(fill=tk.X, pady=10)
# # #         self.start_button = ttk.Button(control_frame, text='Start Now', command=self.start)
# # #         self.start_button.pack(side=tk.LEFT, padx=5)
# # #         self.schedule_button = ttk.Button(control_frame, text='Schedule', command=self.schedule_attendance)
# # #         self.schedule_button.pack(side=tk.LEFT, padx=5)
# # #         self.stop_button = ttk.Button(control_frame, text='Stop', command=self.stop)
# # #         self.stop_button.pack(side=tk.LEFT, padx=5)

# # #         # Status and summary
# # #         self.status_label = ttk.Label(self.main_frame, text="Status: Not Running")
# # #         self.status_label.pack(pady=5)
# # #         summary_frame = ttk.LabelFrame(self.main_frame, text="Attendance Summary", padding="5")
# # #         summary_frame.pack(fill=tk.BOTH, expand=True, pady=5)
# # #         self.summary_text = tk.Text(summary_frame, height=10)
# # #         self.summary_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

# # #     def check_password(self):
# # #         pwd = simpledialog.askstring("Password", "Enter admin password:", show='*', parent=self.master)
# # #         if pwd == ADMIN_PASSWORD:
# # #             self.enable_controls()
# # #         else:
# # #             messagebox.showerror("Error", "Incorrect password.", parent=self.master)

# # #     def update_status(self, status):
# # #         self.status_label.config(text=f"Status: {status}")

# # #     def disable_controls(self):
# # #         for w in [self.start_hour, self.start_minute, self.end_hour, self.end_minute,
# # #                   self.start_button, self.schedule_button, self.stop_button]:
# # #             w.config(state=tk.DISABLED)

# # #     def enable_controls(self):
# # #         for w in [self.start_hour, self.start_minute, self.end_hour, self.end_minute,
# # #                   self.start_button, self.schedule_button, self.stop_button]:
# # #             w.config(state=tk.NORMAL)

# # #     def select_folder(self):
# # #         folder = filedialog.askdirectory(parent=self.master)
# # #         if folder:
# # #             self.folder = folder
# # #             self.folder_label.config(text=folder)
# # #             json.dump({'folder': folder}, open(CONFIG_FILE,'w'))

# # #     def schedule_attendance(self):
# # #         try:
# # #             sh, sm = int(self.start_hour.get()), int(self.start_minute.get())
# # #             eh, em = int(self.end_hour.get()), int(self.end_minute.get())
# # #             start_time = f"{sh:02d}:{sm:02d}"
# # #             end_time = f"{eh:02d}:{em:02d}"
# # #             schedule.every().day.at(start_time).do(self.start)
# # #             schedule.every().day.at(end_time).do(self.stop)
# # #             self.disable_controls()
# # #             messagebox.showinfo('Scheduled', f'Runs daily {start_time}–{end_time}.', parent=self.master)
# # #             if not (self.schedule_thread and self.schedule_thread.is_alive()):
# # #                 self.schedule_thread = threading.Thread(target=self.run_schedule, daemon=True)
# # #                 self.schedule_thread.start()
# # #         except ValueError:
# # #             messagebox.showerror('Error', 'Enter valid HH/MM numbers.', parent=self.master)

# # #     def run_schedule(self):
# # #         while True:
# # #             schedule.run_pending()
# # #             time.sleep(1)

# # #     def compute_interval_start(self, now):
# # #         m = (now.minute//5)*5
# # #         return now.replace(minute=m, second=0, microsecond=0)

# # #     def make_filename(self, dt):
# # #         return dt.strftime('attendance_%Y%m%d_%I%M_%p.xlsx')

# # #     def load_state(self):
# # #         now = datetime.now()
# # #         interval = self.compute_interval_start(now).strftime('%Y%m%d_%I%M_%p')
# # #         if os.path.exists(STATE_FILE):
# # #             try:
# # #                 st = json.load(open(STATE_FILE))
# # #                 if st.get('interval') == interval:
# # #                     df = pd.DataFrame(st.get('records', []))
# # #                     df.columns = ['Name','Time']
# # #                     return df
# # #             except:
# # #                 pass
# # #         return pd.DataFrame(columns=['Name','Time'])

# # #     def save_state(self):
# # #         state = {'interval': self.interval_start.strftime('%Y%m%d_%I%M_%p'),
# # #                  'records': self.attendance_df.to_dict(orient='records')}
# # #         json.dump(state, open(STATE_FILE,'w'))

# # #     def start(self):
# # #         self.sfr.load_encoding_images(self.folder)
# # #         now = datetime.now()
# # #         self.interval_start = self.compute_interval_start(now)
# # #         self.current_file = os.path.join(self.folder, self.make_filename(self.interval_start))
# # #         self.attendance_df = self.load_state()
# # #         if self.attendance_df.empty and os.path.exists(self.current_file):
# # #             try:
# # #                 self.attendance_df = pd.read_excel(self.current_file)
# # #             except:
# # #                 self.attendance_df = pd.read_csv(self.current_file.replace('.xlsx','.csv'))
# # #             self.attendance_df.columns = ['Name','Time']
# # #         self.next_rotate = self.interval_start + self.record_interval
# # #         self.running = True
# # #         self.cap = cv2.VideoCapture(0)
# # #         self.update_status("Running")
# # #         threading.Thread(target=self.loop, daemon=True).start()

# # #     def loop(self):
# # #         while self.running:
# # #             ret, frame = self.cap.read()
# # #             if not ret: break
# # #             frame = cv2.flip(frame,1)
# # #             frame = self.sfr.detect_and_mark(frame, self.attendance_df)
# # #             cv2.imshow('Attendance', frame)
# # #             if cv2.waitKey(1)&0xFF==ord('q'): self.stop()
# # #             if datetime.now()>=self.next_rotate:
# # #                 self.save()
# # #                 self.interval_start=self.next_rotate
# # #                 self.current_file=os.path.join(self.folder,self.make_filename(self.interval_start))
# # #                 self.attendance_df=pd.DataFrame(columns=['Name','Time'])
# # #                 self.next_rotate=self.interval_start+self.record_interval
# # #         cv2.destroyAllWindows()

# # #     def save(self):
# # #         try: self.attendance_df.to_excel(self.current_file,index=False)
# # #         except: self.attendance_df.to_csv(self.current_file.replace('.xlsx','.csv'),index=False)
# # #         self.save_state()

# # #     def stop(self):
# # #         self.running=False
# # #         if self.cap: self.cap.release()
# # #         self.save()
# # #         self.update_status("Stopped")
# # #         summary=self.show_attendance_summary()
# # #         self.summary_text.delete(1.0,tk.END)
# # #         self.summary_text.insert(tk.END,summary)
# # #         messagebox.showinfo('Stopped',f'Saved to {self.current_file}\n\n{summary}',parent=self.master)

# # #     def show_attendance_summary(self):
# # #         if self.attendance_df.empty: return "No attendance records found."
# # #         summary="=== Attendance Summary ===\n\n"
# # #         known=set(self.sfr.known_face_names)
# # #         present=set(self.attendance_df['Name'])
# # #         absent=known-present
# # #         summary+="Present:\n"
# # #         for n in sorted(present): summary+=f"- {n} (First seen: {self.attendance_df[self.attendance_df['Name']==n]['Time'].min()})\n"
# # #         summary+="\nAbsent:\n"
# # #         for n in sorted(absent): summary+=f"- {n}\n"
# # #         return summary

# # # if __name__=='__main__':
# # #     root=tk.Tk()
# # #     app=AttendanceApp(root)
# # #     root.mainloop()

# # # is the best


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
from tkinter import ttk, filedialog, messagebox, simpledialog
import schedule
import time

CONFIG_FILE = 'attendance_config.json'
STATE_FILE = 'attendance_state.json'
ADMIN_PASSWORD = 'admin'

class EnhancedFaceRecognition:
    def __init__(self, confidence_threshold=0.6):
        self.known_face_encodings = []
        self.known_face_names = []
        self.confidence_threshold = confidence_threshold

    def load_encoding_images(self, images_path):
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
            if name and 'Name' in attendance_df.columns and name not in attendance_df['Name'].values:
                timestamp = datetime.now().strftime('%Y-%m-%d %I:%M:%S %p')
                attendance_df.loc[len(attendance_df)] = [name, timestamp]
            label = f"{name} (OK)" if name else 'Unknown'
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

        # Initialize UI
        self.main_frame = ttk.Frame(master, padding="10")
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        style = ttk.Style()
        style.configure('TButton', padding=5)
        style.configure('TLabel', padding=5)

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
        self.schedule_start_time = None
        self.schedule_end_time = None
        self.interval_start = None
        self.next_rotate = None
        self.current_file = None
        self.attendance_df = pd.DataFrame(columns=['Name', 'Time'])

        self.create_ui()
        self.disable_controls()

        self.running = False
        self.cap = None
        self.schedule_thread = None

    def create_ui(self):
        folder_frame = ttk.LabelFrame(self.main_frame, text="Image Folder", padding="5")
        folder_frame.pack(fill=tk.X, pady=5)
        self.folder_label = ttk.Label(folder_frame, text=self.folder or "No folder selected")
        self.folder_label.pack(side=tk.LEFT, padx=5)
        ttk.Button(folder_frame, text='Select Folder', command=self.select_folder).pack(side=tk.RIGHT, padx=5)

        pass_frame = ttk.Frame(self.main_frame)
        pass_frame.pack(fill=tk.X, pady=5)
        ttk.Button(pass_frame, text='Enter Password', command=self.check_password).pack(side=tk.LEFT, padx=5)

        schedule_frame = ttk.LabelFrame(self.main_frame, text="Schedule Settings", padding="5")
        schedule_frame.pack(fill=tk.X, pady=5)
        ttk.Label(schedule_frame, text="Start Time:").grid(row=0, column=0, padx=5, pady=5)
        self.start_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
        self.start_hour.grid(row=0, column=1, padx=5)
        self.start_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
        self.start_minute.grid(row=0, column=2, padx=5)
        ttk.Label(schedule_frame, text="End Time:").grid(row=1, column=0, padx=5, pady=5)
        self.end_hour = ttk.Spinbox(schedule_frame, from_=0, to=23, width=5)
        self.end_hour.grid(row=1, column=1, padx=5)
        self.end_minute = ttk.Spinbox(schedule_frame, from_=0, to=59, width=5)
        self.end_minute.grid(row=1, column=2, padx=5)

        control_frame = ttk.Frame(self.main_frame)
        control_frame.pack(fill=tk.X, pady=10)
        self.start_button = ttk.Button(control_frame, text='Start Now', command=self.start)
        self.start_button.pack(side=tk.LEFT, padx=5)
        self.schedule_button = ttk.Button(control_frame, text='Schedule', command=self.schedule_attendance)
        self.schedule_button.pack(side=tk.LEFT, padx=5)
        self.stop_button = ttk.Button(control_frame, text='Stop', command=self.stop)
        self.stop_button.pack(side=tk.LEFT, padx=5)

        self.status_label = ttk.Label(self.main_frame, text="Status: Not Running")
        self.status_label.pack(pady=5)
        summary_frame = ttk.LabelFrame(self.main_frame, text="Attendance Summary", padding="5")
        summary_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        self.summary_text = tk.Text(summary_frame, height=10)
        self.summary_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    def check_password(self):
        pwd = simpledialog.askstring("Password", "Enter admin password:", show='*', parent=self.master)
        if pwd == ADMIN_PASSWORD:
            self.enable_controls()
        else:
            messagebox.showerror("Error", "Incorrect password.", parent=self.master)

    def update_status(self, status):
        self.status_label.config(text=f"Status: {status}")

    def disable_controls(self):
        for w in [self.start_hour, self.start_minute, self.end_hour, self.end_minute,
                  self.start_button, self.schedule_button, self.stop_button]:
            w.config(state=tk.DISABLED)

    def enable_controls(self):
        for w in [self.start_hour, self.start_minute, self.end_hour, self.end_minute,
                  self.start_button, self.schedule_button, self.stop_button]:
            w.config(state=tk.NORMAL)

    def select_folder(self):
        folder = filedialog.askdirectory(parent=self.master)
        if folder:
            self.folder = folder
            self.folder_label.config(text=folder)
            json.dump({'folder': folder}, open(CONFIG_FILE,'w'))

    def schedule_attendance(self):
        try:
            sh, sm = int(self.start_hour.get()), int(self.start_minute.get())
            eh, em = int(self.end_hour.get()), int(self.end_minute.get())
            self.schedule_start_time = f"{sh:02d}:{sm:02d}"
            self.schedule_end_time = f"{eh:02d}:{em:02d}"
            # clear state before scheduling interval
            if os.path.exists(STATE_FILE):
                os.remove(STATE_FILE)
            schedule.every().day.at(self.schedule_start_time).do(self.start)
            schedule.every().day.at(self.schedule_end_time).do(self.stop)
            self.disable_controls()
            messagebox.showinfo('Scheduled', f'Runs daily {self.schedule_start_time}–{self.schedule_end_time}.', parent=self.master)
            if not (self.schedule_thread and self.schedule_thread.is_alive()):
                self.schedule_thread = threading.Thread(target=self.run_schedule, daemon=True)
                self.schedule_thread.start()
        except ValueError:
            messagebox.showerror('Error', 'Enter valid HH/MM numbers.', parent=self.master)

    def run_schedule(self):
        while True:
            schedule.run_pending()
            time.sleep(1)

    def compute_interval_start(self, now):
        m = (now.minute//5)*5
        return now.replace(minute=m, second=0, microsecond=0)

    def make_filename(self, dt):
        date_str = dt.strftime('%Y%m%d')
        return f"attendance_{date_str}_{self.schedule_start_time.replace(':','')}-{self.schedule_end_time.replace(':','')}.xlsx"

    def load_state(self):
        now = datetime.now()
        interval = self.compute_interval_start(now).strftime('%Y%m%d_%I%M_%p')
        if os.path.exists(STATE_FILE):
            try:
                st = json.load(open(STATE_FILE))
                if st.get('interval') == interval:
                    df = pd.DataFrame(st.get('records', []))
                    df.columns = ['Name','Time']
                    return df
            except:
                pass
        return pd.DataFrame(columns=['Name','Time'])

    def save_state(self):
        state = {'interval': self.interval_start.strftime('%Y%m%d_%I%M_%p'),
                 'records': self.attendance_df.to_dict(orient='records')}
        json.dump(state, open(STATE_FILE,'w'))

    def start(self):
        # load or init state for this interval
        self.attendance_df = self.load_state()

        self.sfr.load_encoding_images(self.folder)
        now = datetime.now()
        self.interval_start = self.compute_interval_start(now)
        self.current_file = os.path.join(self.folder, self.make_filename(self.interval_start))
        if self.attendance_df.empty and os.path.exists(self.current_file):
            try:
                self.attendance_df = pd.read_excel(self.current_file)
            except:
                self.attendance_df = pd.read_csv(self.current_file.replace('.xlsx','.csv'))
            self.attendance_df.columns = ['Name','Time']
        self.next_rotate = self.interval_start + self.record_interval
        self.running = True
        self.cap = cv2.VideoCapture(0)
        self.update_status("Running")
        threading.Thread(target=self.loop, daemon=True).start()

    def loop(self):
        while self.running:
            ret, frame = self.cap.read()
            if not ret: break
            frame = cv2.flip(frame,1)
            frame = self.sfr.detect_and_mark(frame, self.attendance_df)
            cv2.imshow('Attendance', frame)
            if cv2.waitKey(1)&0xFF==ord('q'): self.stop()
            if datetime.now()>=self.next_rotate:
                self.save()
                self.interval_start=self.next_rotate
                self.current_file=os.path.join(self.folder,self.make_filename(self.interval_start))
                self.attendance_df=pd.DataFrame(columns=['Name','Time'])
                self.next_rotate=self.interval_start+self.record_interval
        cv2.destroyAllWindows()

    def save(self):
        try: self.attendance_df.to_excel(self.current_file,index=False)
        except: self.attendance_df.to_csv(self.current_file.replace('.xlsx','.csv'),index=False)
        self.save_state()

    def stop(self):
        self.running=False
        if self.cap: self.cap.release()
        self.save()
        self.update_status("Stopped")
        summary=self.show_attendance_summary()
        self.summary_text.delete(1.0,tk.END)
        self.summary_text.insert(tk.END,summary)
        messagebox.showinfo('Stopped',f'Saved to {self.current_file}\n\n{summary}',parent=self.master)

    def show_attendance_summary(self):
        if self.attendance_df.empty: return "No attendance records found."
        summary="=== Attendance Summary ===\n\n"
        known=set(self.sfr.known_face_names)
        present=set(self.attendance_df['Name'])
        absent=known-present
        summary+="Present:\n"
        for n in sorted(present): summary+=f"- {n} (First seen: {self.attendance_df[self.attendance_df['Name']==n]['Time'].min()})\n"
        summary+="\nAbsent:\n"
        for n in sorted(absent): summary+=f"- {n}\n"
        return summary

if __name__=='__main__':
    root=tk.Tk()
    app=AttendanceApp(root)
    root.mainloop()
# god 



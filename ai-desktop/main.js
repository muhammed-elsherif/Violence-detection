// ai-desktop/main.js
const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let nestProc, fastapiProc, win;

function startNest() {
  nestProc = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "start:prod"],
    { cwd: path.resolve(__dirname, "../backend") }
  );
  nestProc.stdout.pipe(process.stdout);
  nestProc.stderr.pipe(process.stderr);
  nestProc.on("error", e => console.error("Nest failed:", e));
  nestProc.on("exit", code => console.log("Nest exited:", code));
}

function startFastAPI() {
  const python = process.platform === "win32" ? "python" : "python3";
  fastapiProc = spawn(
    python,
    ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001"],
    { cwd: path.resolve(__dirname, "../Machine Learning") }
  );
  fastapiProc.stdout.pipe(process.stdout);
  fastapiProc.stderr.pipe(process.stderr);
  fastapiProc.on("error", e => console.error("FastAPI failed:", e));
  fastapiProc.on("exit", code => console.log("FastAPI exited:", code));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile(path.join(__dirname, "index.html"));
  win.on("closed", () => (win = null));
}

app.whenReady().then(() => {
  startNest();
  startFastAPI();
  createWindow();
});

app.on("window-all-closed", () => {
  if (nestProc) nestProc.kill();
  if (fastapiProc) fastapiProc.kill();
  if (process.platform !== "darwin") app.quit();
});

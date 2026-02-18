const path = require("path");
const { app, BrowserWindow } = require("electron");

const useDevServer = Boolean(process.env.ELECTRON_RENDERER_URL);

function createWindow() {
  const window = new BrowserWindow({
    width: 1500,
    height: 950,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    title: "Storyboarder",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  if (useDevServer) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

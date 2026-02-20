const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const useDevServer = Boolean(process.env.ELECTRON_RENDERER_URL);

function getDataDir() {
  const dir = path.join(app.getPath('userData'), 'storyboarder-data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getProjectsDir() {
  const dir = path.join(getDataDir(), 'projects');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getSettingsPath() {
  return path.join(getDataDir(), 'settings.json');
}

function registerIpcHandlers() {
  ipcMain.handle('settings:load', () => {
    const settingsPath = getSettingsPath();
    if (!fs.existsSync(settingsPath)) {
      return { apiKey: '', model: 'anthropic/claude-sonnet-4' };
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      return {
        apiKey: parsed.apiKey || '',
        model: parsed.model || 'anthropic/claude-sonnet-4',
      };
    } catch {
      return { apiKey: '', model: 'anthropic/claude-sonnet-4' };
    }
  });

  ipcMain.handle('settings:save', (_event, settings) => {
    fs.writeFileSync(getSettingsPath(), JSON.stringify(settings || {}, null, 2), 'utf8');
    return true;
  });

  ipcMain.handle('projects:list', () => {
    const files = fs
      .readdirSync(getProjectsDir())
      .filter((file) => file.endsWith('.json'));

    const projects = [];
    for (const file of files) {
      const filePath = path.join(getProjectsDir(), file);
      try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        projects.push({
          id: parsed.id,
          name: parsed.name,
          updatedAt: parsed.updatedAt,
        });
      } catch {
        // skip invalid project files
      }
    }

    return projects;
  });

  ipcMain.handle('projects:load', (_event, projectId) => {
    const safeId = String(projectId || '').trim();
    if (!safeId) {
      return null;
    }

    const filePath = path.join(getProjectsDir(), `${safeId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return null;
    }
  });

  ipcMain.handle('projects:save', (_event, project) => {
    const safeId = String(project?.id || '').trim();
    if (!safeId) {
      throw new Error('project.id is required');
    }

    const filePath = path.join(getProjectsDir(), `${safeId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf8');
    return true;
  });

  ipcMain.handle('projects:delete', (_event, projectId) => {
    const safeId = String(projectId || '').trim();
    if (!safeId) {
      return false;
    }

    const filePath = path.join(getProjectsDir(), `${safeId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1520,
    height: 960,
    minWidth: 1120,
    minHeight: 760,
    show: false,
    title: 'Storyboarder',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  window.once('ready-to-show', () => {
    window.show();
  });

  if (useDevServer) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

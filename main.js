const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray = null;
let isQuitting = false;

// Set application identifiers for Windows
app.setAppUserModelId('com.krislyz.redxa');
app.setName('RedXA');

// Load icon.png or fallback to a simple red-circle SVG
function getAppIcon() {
  const iconPath = path.join(__dirname, 'icon.png');
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  const svg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <circle cx="128" cy="128" r="128" fill="red"/>
</svg>`;
  return nativeImage.createFromDataURL(
    'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
  );
}

// Create the main application window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: getAppIcon(),
    backgroundColor: '#2e2e2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  // Intercept close to minimize to tray
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      showTray();
      new Notification({ title: 'RedXA', body: 'Minimized to tray' }).show();
    }
  });

  // Remove tray when window is shown
  mainWindow.on('show', () => {
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });
}

// Create and display the tray icon + menu
function showTray() {
  if (tray) return;
  const icon = getAppIcon().resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Exit', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('RedXA');

  // Left-click always shows the window
  tray.on('click', () => mainWindow.show());
}

app.whenReady().then(() => {
  createMainWindow();
  Menu.setApplicationMenu(null);
});

// Ensure quit flag is set if the app is closing
app.on('before-quit', () => {
  isQuitting = true;
});

// Handle macOS dock activation
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// Listen for save requests from renderer
ipcMain.on('save-primary-cities', (event, areas) => {
  const configPath = path.join(__dirname, 'config.json');
  const cfg = { areas: areas.map(name => ({ name, isPrimary: true })) };
  try {
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save config:', err);
  }
});

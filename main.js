const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Створюємо вікно браузера
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // Завантажуємо файл index.html з папки dist (збірка Vite)
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // За бажанням: відкрити DevTools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
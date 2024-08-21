const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let windows = {};

function createWindow(tabId) {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true
        }
    });

    windows[tabId] = win;
    win.loadFile('index.html');
    return win;
}

ipcMain.on('navigate-to-url', (event, { tabId, url }) => {
    if (!windows[tabId]) {
        createWindow(tabId);
    }
    windows[tabId].loadURL(url);
});

ipcMain.on('navigate-back', (event, tabId) => {
    if (windows[tabId] && windows[tabId].webContents.canGoBack()) {
        windows[tabId].webContents.goBack();
    }
});

ipcMain.on('navigate-forward', (event, tabId) => {
    if (windows[tabId] && windows[tabId].webContents.canGoForward()) {
        windows[tabId].webContents.goForward();
    }
});


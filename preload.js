/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const {contextBridge, ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

// 导出 electronAPI 给 renderer.js 使用
contextBridge.exposeInMainWorld('electronAPI', {
  HandleBackupUpload: (callback) => ipcRenderer.on('backup-upload', callback),
  HandleCompress: (callback) => ipcRenderer.on('backup-compress', callback),
  HandleUnzip:(callback) => ipcRenderer.on('backup-unzip', callback),

  ChooseDirectory: (game) => ipcRenderer.invoke('ChooseDirectory', game),
  ScanDirectory: (game) => ipcRenderer.invoke('ScanDirectory', game),
  // SaveGameDirectory: (path) => ipcRenderer.invoke('SaveGameDirectory', path),
  GetGameDirectory: (game) => ipcRenderer.invoke('GetGameDirectory', game),
  // Ready: (game, data) => ipcRenderer.invoke('Ready', game, data),
  // GetBackupFromLocal: (game) => ipcRenderer.invoke('GetBackupFromLocal', game),
  GetBackupFromServer: (data) => ipcRenderer.invoke('GetBackupFromServer', data),
  DeleteBackupFromServer: (data) => ipcRenderer.invoke('DeleteBackupFromServer', data),
  LoadCheckLogin: () => ipcRenderer.invoke('LoadCheckLogin'),
  Login: (data) => ipcRenderer.invoke('Login', data),
  Logout: () => ipcRenderer.invoke('Logout'),
  RecoverBackup: (data) => ipcRenderer.invoke('RecoverBackup', data),
  CompressBackup: (game, flag) => ipcRenderer.invoke('CompressBackup', game, flag),
  UploadBackup:(game, file) => ipcRenderer.invoke('UploadBackup', game, file),
  

  // 获取初始化内容
  GetLocalConfig: () => ipcRenderer.invoke('GetLocalConfig')
})
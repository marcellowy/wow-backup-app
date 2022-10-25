// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const {
  ChooseDirectory, 
  ScanDirectory, 
  GetGameDirectory,
  SetMainWindow,
  CompressBackup,
  UploadBackup,
  GetLocalConfig,
  RecoverBackup,
  UpdateBigFoot,
  GetBigFootNewVersion
} = require('./lib/event')
const {LoadCheckLogin,Login,Logout} = require('./lib/login')
const {Test} = require('./lib/http')
const {GetBackupFromServer, DeleteBackupFromServer} = require('./lib/backup')
const {Init} = require('./lib/store')

let mainWindow = null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // frame: false, // 隐藏标题栏
    // titleBarStyle: 'hiddenInset', // 隐藏标题栏,但不隐藏砑角的关闭按钮
    // resizable: false,
    width: 1200,
    height: 800,
    icon: path.join(__dirname, './icons/png/512x512.png'), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, './icons/png/512x512.png'));
  }

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', (event) => {
    if(app.quitting) {
      mainWindow = null // why???
    } else {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // 设置一个mainWindow
  SetMainWindow(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  ipcMain.handle('ChooseDirectory', ChooseDirectory)  // 打开目录
  ipcMain.handle('ScanDirectory', ScanDirectory)  // 扫文件
  // ipcMain.handle('SaveGameDirectory', SaveGameDirectory)  
  ipcMain.handle('GetGameDirectory', GetGameDirectory) 
  // ipcMain.handle('Ready', Ready) 
  // ipcMain.handle('GetBackupFromLocal', GetBackupFromLocal) 
  ipcMain.handle('GetBackupFromServer', GetBackupFromServer)
  ipcMain.handle('DeleteBackupFromServer', DeleteBackupFromServer)
  ipcMain.handle('LoadCheckLogin', LoadCheckLogin) 
  ipcMain.handle('Login', Login)
  ipcMain.handle('Logout', Logout)
  ipcMain.handle('RecoverBackup', RecoverBackup)
  ipcMain.handle('CompressBackup', CompressBackup)
  ipcMain.handle('UploadBackup', UploadBackup)
  ipcMain.handle('GetLocalConfig', GetLocalConfig)
  ipcMain.handle('UpdateBigFoot', UpdateBigFoot)
  ipcMain.handle('GetBigFootNewVersion', GetBigFootNewVersion)
  
  
  // init Store
  Init()

  createWindow()

  app.on('activate', function (event, hasVisibleWindows) {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
    mainWindow.show()
  })

  app.on('before-quit', () => app.quitting = true)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
global.sharedObject = {
  config: null
}
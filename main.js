// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const config = require('./config')

const isDevelopment = process.env.NODE_ENV === 'development'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let editorWindow
let renderWindow
let videoWindow

function createWindows () {
  createEditorWindow()
  createRenderWindow()
  createVideoWindow()
}

function createVideoWindow () {
  // Create the browser window.
  videoWindow = new BrowserWindow({
    width: 640,
    height: 360,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  videoWindow.loadFile('video.html')

  // Open the DevTools.
  if (isDevelopment) videoWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  videoWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    videoWindow = null
  })
}

function createEditorWindow () {
  // Create the browser window.
  editorWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    minWidth: 900,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  editorWindow.loadFile('editor.html')

  // Open the DevTools.
  if (isDevelopment) editorWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  editorWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    editorWindow = null
  })
}

function createRenderWindow () {
  // Create the browser window.
  renderWindow = new BrowserWindow({
    width: 500,
    height: 500,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  renderWindow.loadFile('render.html')

  // Open the DevTools.
  if (isDevelopment) renderWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  renderWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    renderWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (editorWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('render', (event, message) => {
  renderWindow && renderWindow.webContents.send('render', message)
})

ipcMain.on('video', (event, message) => {
  videoWindow && videoWindow.webContents.send('video', message)
})

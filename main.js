const { app, BrowserWindow, shell, autoUpdater, dialog } = require('electron')
const server = "https://fghjkl-cktffnjv7-lucasliaor.vercel.app"
const url = `${server}/update/${process.platform}/v2`
const path = require('path')

console.log(url)

// Custom protocol registering (File open with url)
if (process.defaultApp) {
	if (process.argv.length >= 2) {
		app.setAsDefaultProtocolClient('hl7-relay-app', process.execPath, [path.resolve(process.argv[1])])
	}
} else {
	app.setAsDefaultProtocolClient('hl7-relay-app')
}

// App windows create
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools();
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()
    autoUpdater.setFeedURL({ url });
    autoUpdater.checkForUpdates();
  })
}

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') app.quit()
})


// UPDATER
autoUpdater.setFeedURL({ url });

setInterval(() => {
  console.log('sserach')
  autoUpdater.checkForUpdates();
}, 10000)


autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  console.log('update')
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    console.log('YES')
    // if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})
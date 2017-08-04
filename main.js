const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const appMenu = require( path.resolve( __dirname, './modules/appMenu.js' ) ); 

let mainWindow;

function CreateMain() {
    console.log("creating main window");
    mainWindow = new BrowserWindow({width: 500, height: 500, webPreferences : {experimentalFeatures: true }})
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

Menu.setApplicationMenu(appMenu)

ipcMain.on('save-file', (event, arg) => {
    let value = ipc.sendSync('get-document')
    file.save(umlDoc.getValue(), loadedFile)
})


app.on('ready', CreateMain)

// Deactivate instead of quitting on Mac
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

// Reactivate on Mac
app.on('activate', function () {
    if (mainWindow === null) {
      createWindow()
    }
})
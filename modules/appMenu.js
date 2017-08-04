const {app, Menu, webContents} = require('electron')
const ipc = require('electron').ipcMain;

const template = [
    {
        label: 'File',
        submenu: [
            {label: 'New Diagram', accelerator: 'CmdOrCtrl+N', click: (item, focusedWindow) => {
                focusedWindow.send('new-diagram')
            }},
            {type: 'separator'},
            {label: 'Open', accelerator: 'CmdOrCtrl+O', click: (item, focusedWindow) => {
                focusedWindow.send('open-file')
            }},
            {label: 'Save', accelerator: 'CmdOrCtrl+S', click: (item, focusedWindow) => {
                focusedWindow.send('save-file')
            }},
            {label: 'Save as..', accelerator: 'CmdOrCtrl+Shift+S', click: (item, focusedWindow) => {
                focusedWindow.send('save-file-as')
            }},
            {type: 'separator'},
            {label: 'Export as Image', accelerator: 'CmdOrCtrl+E', click: (item, focusedWindow) => {
                focusedWindow.send('export-diagram')
            }}
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    },
    {
        label: 'Dev',
        submenu: [
            {role: 'reload'},
            {role: 'toggledevtools'}
        ]
    },
    {
        role: 'window',
        submenu: [
            {role: 'minimize'},
            {role: 'close'}
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Mermaid Syntax',
                click () { require('electron').shell.openExternal('http://knsv.github.io/mermaid/#graph') }
            },
            {
                label: 'Learn More',
                click () { require('electron').shell.openExternal('https://electron.atom.io') }
            }
        ]
    }
]

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services', submenu: []},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'}
        ]
    })

    // Window menu
    template[3].submenu = [
        {role: 'close'},
        {role: 'minimize'},
        {role: 'zoom'},
        {type: 'separator'},
        {role: 'front'}
    ]
}

module.exports = Menu.buildFromTemplate(template)
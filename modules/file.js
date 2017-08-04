const fs = require('fs')
const {dialog} = require('electron').remote

function WriteFile(content, filename) {
    fs.writeFile(filename, content, {}, (err, res) => {
        if(err){
            dialog.showErrorBox("File save error", err)           
            console.error(err)
            return
        }
        console.log("Wrote file " + filename);
    })
}

exports.save = function(content, filename, callback) {

    if (filename != null)
    {
        WriteFile(content, filename)
        return
    }

    // File dialog if no file name was provided
    dialog.showSaveDialog({
        title: 'Save diagram',
        filters: [
            { name: 'Mermaid file', extensions: ['mmd'] }
        ]
    }, function (filename) {
        WriteFile(content, filename)
        callback(filename)
    })
}

exports.open = function(callback) {
    dialog.showOpenDialog({
        title: 'Open diagram',
        properties: ['openFile'], 
        filters: [
            { name: 'Mermaid file', extensions: ['mmd'] }
        ]
    }, (filenames) => {
        fs.readFile(filenames[0], 'utf8', (err, data) => {
            if (err){
                dialog.showErrorBox("File save error", err)           
                console.error(err)
                return
            }
            callback(data, filenames[0])
        })
    })
}
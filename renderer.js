const {dialog} = require('electron').remote
const ipc = require('electron').ipcRenderer
const fs = require('fs')
const d3 = require('d3')
const file = require('./modules/file.js'); 

let loadedFile = null
let umlEditor = CodeMirror.fromTextArea(document.getElementById('uml-editor'), {lineNumbers: true})
let umlDoc = umlEditor.getDoc()
let el = document.querySelector("#graph-div");
let errorMarkers = []
let errorWidgets = []

ipc.on('export-diagram',(event, arg) => {
    ExportToPng();
})

ipc.on('save-file', (event, arg) => {
    file.save(umlDoc.getValue(), loadedFile, SetLoadedFile)
})

ipc.on('save-file-as', (event, arg) => {
    file.save(umlDoc.getValue(), null, SetLoadedFile)
})

ipc.on('open-file', (event, arg) => {
    let content = file.open((content, fileName) => {
        if(fileName != null) {
            LoadFile(content, fileName)
        }
    })
})

ipc.on('new-diagram', (event, arg) => {
    ClearFile();
})

mermaidAPI.initialize({startOnLoad:false})

let debounceTimeout;
umlEditor.on('change', () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(UpdateUml, 500)
});

function ClearFile() {
    umlDoc.setValue("")
    SetLoadedFile(null);
}

function LoadFile(content, fileName) {
    umlDoc.setValue(content)
    SetLoadedFile(fileName)
}

function SetLoadedFile(fileName) {
    loadedFile = fileName
    //TODO: Set window title
}

function UpdateUml() {
    console.log('Updating UML')
    
    ClearParseErrors();

    mermaidAPI.render('graph', umlEditor.getValue(), (svgCode, bindFunctions) => {
        console.log(svgCode)
        el.innerHTML = svgCode
    }, el)

    mermaidAPI.parseError = function(err,errorObject){
        console.error(err)
        DisplayParseErrors(errorObject)
    }
}

function ClearParseErrors() {
    errorMarkers.forEach(marker => marker.clear())
    errorMarkers.length = 0
    errorWidgets.forEach(widget => widget.clear())
    errorWidgets.length = 0
}

function DisplayParseErrors(errorObject) {
    errorMarkers.push(umlEditor.markText(
        { line: errorObject.loc.first_line -1, ch: errorObject.loc.first_column },
        { line: errorObject.loc.last_line -1, ch: errorObject.loc.last_column },
        { className: "error-marking"}
    ))

    // TODO: extract creating error message
    let expectedList = ""
    for(i = 0; i < errorObject.expected.length; i++){
        expectedList += errorObject.expected[i]
        if (i == errorObject.expected.length - 1)
            expectedList += "."
        else if (i == errorObject.expected.length - 2)
            expectedList += ", or "
        else
            expectedList += ", "
    }
    let widgetObj = document.createElement("div")
    widgetObj.className = "error-widget"
    widgetObj.innerHTML = "<strong>Parse error:</strong><br/>Expected: " + expectedList + "<br/>Found: " + errorObject.token
    errorWidgets.push(umlDoc.addLineWidget(errorObject.loc.last_line - 1, widgetObj))
}

// TODO: Export to module
function ExportToPng() {
    // get styles from all required stylesheets
    // http://www.coffeegnome.net/converting-svg-to-png-with-canvg/
    var style = "\n";
    var requiredSheets = []; // list of required CSS
    for (var i=0; i<document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if (sheet.href) {
            var sheetName = sheet.href.split('/').pop();
            if (requiredSheets.indexOf(sheetName) != -1) {
                var rules = sheet.rules;
                if (rules) {
                    for (var j=0; j<rules.length; j++) {
                        style += (rules[j].cssText + '\n');
                    }
                }
            }
        }
    }

    var svg = d3.select("svg"),
        img = new Image(),
        serializer = new XMLSerializer(),
        width = svg.node().getBBox().width,
        height = svg.node().getBBox().height;

    // prepend style to svg
    svg.insert('defs',":first-child")
    d3.select("svg defs")
        .append('style')
        .attr('type','text/css')
        .html(style);

    var svgStr = serializer.serializeToString(svg.node());
    img.src = 'data:image/svg+xml;base64,'+window.btoa(unescape(encodeURIComponent(svgStr)));

    var canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(img,0,0,width,height);

    canvas.toBlob((blob) => {

        const options = {
            title: 'Export an Image',
            filters: [
                { name: 'Images', extensions: ['png'] }
            ]
        }
        dialog.showSaveDialog(options, function (filename) {
            var reader = new FileReader()
            reader.onload = function(){
                var buffer = new Buffer(reader.result)
                fs.writeFile(filename, buffer, {}, (err, res) => {
                    if(err){
                        console.error(err)
                        return
                    }
                    console.log("Exported as " + filename);
                })
            }
            reader.readAsArrayBuffer(blob)
        })
    })
}

UpdateUml();

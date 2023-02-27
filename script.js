let JSZipLoaded = false;
let localZip = null;
let convertNumber = 0;
let totalLog = "";
function convertFile(ReadFile) {
    for (let i = 0; i < ReadFile.length; i++) {
        if (ReadFile[i].indexOf("]") == -1) continue;
        let ReadChange = ReadFile[i].substring(0, ReadFile[i].indexOf("]"));
        let choosePlusOrMinus = randomInt(1, 3);
        let options = getOptionMap();
        if (options.options.value.bothAdditionSubtraction == "1") choosePlusOrMinus = 2; else if (options.options.value.bothAdditionSubtraction == "2") choosePlusOrMinus = 1;
        let cutThis = 2;
        if (choosePlusOrMinus == 1) cutThis = randomInt(options.options.value.minSubtraction, options.options.value.maxSubtraction); else cutThis = randomInt(options.options.value.minAddition, options.options.value.maxAddition);
        if (choosePlusOrMinus == 2) cutThis = randomInt(1, 8);
        let composeNew = [parseInt(ReadChange.substring(1, 3)), parseInt(ReadChange.substring(4, 6)), parseInt(ReadChange.substring(7, 9))];
        if (choosePlusOrMinus == 1) {
            let zeroTotal = false;
            if (composeNew[2] < cutThis) {
                if (composeNew[1] - 1 < 0) {
                    if (composeNew[0] == 0) {
                        zeroTotal = true;
                    } else {
                        composeNew[0]--;
                        composeNew[1] = 59;
                    }
                }
                else {
                    composeNew[1]--;
                }
                if (!zeroTotal) composeNew[2] = 100 + composeNew[2] - cutThis; else composeNew = [0, 0, 0];
            }
            else {
                composeNew[2] = composeNew[2] - cutThis;
            }
        }
        else {
            if (composeNew[2] + cutThis > 99) {
                if (composeNew[1] + 1 > 59) {
                    composeNew[0]++;
                    composeNew[1] = 0;
                }
                else {
                    composeNew[1]++;
                }
                composeNew[2] = composeNew[2] + cutThis - 99;
            }
            else {
                composeNew[2] = composeNew[2] + cutThis;
            }
        }
        let converrtThing = [composeNew[0].toString(), composeNew[1].toString(), composeNew[2].toString()];
        if (converrtThing[0].length == 1) converrtThing[0] = `0${converrtThing[0]}`;
        if (converrtThing[1].length == 1) converrtThing[1] = `0${converrtThing[1]}`;
        if (converrtThing[2].length == 1) converrtThing[2] = `0${converrtThing[2]}`;
        ReadFile[i] = `[${converrtThing[0]}: ${converrtThing[1]}.${converrtThing[2]}]${ReadFile[i].substring(10)}`;
        if (totalLog != "") totalLog = totalLog + `\n[${getDate()}] Addition (2) / Subtraction (1) (-> ${choosePlusOrMinus}) for line ${i} of ${cutThis} milliseconds    (File: ${convertNumber})`;
    }
    convertNumber++;
    return ReadFile.join("\n");
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function downloadFile(textContent, fileName) {
    if (localZip !== null) {
        if (totalLog != "") totalLog = totalLog + `\n[${getDate()}]Zipping file ${fileName}`; 
        localZip.file(fileName, textContent);  
    } else {
        if (totalLog != "") totalLog = totalLog + `\n[${getDate()}]Downloading file ${fileName}`; 
        saveElement(textContent, fileName, "lrc")
    }
}
function saveElement(textContent, fileName, extension) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([textContent], { type: "text/plain" }));
    a.download = getOptionMap().options.value.fileFormat.replaceAll("{FinalExtension}", extension).replaceAll("{FileName}", fileName);
    a.click();
}
function readLrc(fileId) {
    let options = getOptionMap();
    if (options.options.value.enableLogging == 1 || options.options.value.enableLogging == 2) totalLog = "[RandomizeLRC Web - Version 0.9.0 (Beta)]";
    if (options.options.value.useZip == 0 && fileId.length > 1) getZip(); else if (options.options.value.useZip == 1) getZip();
    if (JSZipLoaded == true && localZip == null) {
        setTimeout(function() {
            readLrc(fileId)
        }, 300);
        return;
    }
    if (options.options.value.useZip == 0 && fileId.length > 1 | options.options.value.useZip == 1) useZip = true;
    Array.from(fileId).forEach(inputItem => {
        let readFile = new FileReader();
        readFile.readAsText(inputItem);
        readFile.onload = function () {
            if (totalLog != "") totalLog = totalLog + `\n[${getDate()}]Successful read of ${inputItem.name}. Starting converting.\n____________________\nConversion Stats\n____________________`;
            downloadFile(convertFile(readFile.result.split("\n")), inputItem.name);
            if (convertNumber > fileId.length - 1) exportZip();
        }
    });        
}
function exportZip() {
    if (localZip != null) {
        if (totalLog != "") totalLog = totalLog + `\n[${getDate()}]Zipping final file...` ;
        localZip.generateAsync({ type: "blob" }).then(function(content) {
            saveElement(content, "LRCLyrics", "zip");
            localZip = null;
        });      
    }
    if (totalLog != "") {
        let options = getOptionMap();
        if (options.options.value.enableLogging == 2) saveElement(totalLog, "RandomizeLRC.log", "txt"); else if (options.options.value.enableLogging == 1) console.log(totalLog);
    }
}
function openFile() {
    let inputFile = document.getElementById("input");
    convertNumber = 0;
    inputFile.addEventListener("change", function () {
        readLrc(inputFile.files)
    });
    inputFile.click();
}
function dropHandler(ev) {
    ev.preventDefault();
    convertNumber = 0;
    changeDropNotice(false);
    if (ev.dataTransfer.items) {
        let fileToPass = [];
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') fileToPass[fileToPass.length] = ev.dataTransfer.items[i].getAsFile(); else fileToPass[fileToPass.length] = ev.dataTransfer.files[i];
        }
        readLrc(fileToPass);
    }
}
function dragOverHandler(ev) {
    ev.preventDefault();
}
function changeDropNotice(show) {
    if (show) document.getElementById('drophere').classList.add('ondrop'); else document.getElementById('drophere').classList.remove('ondrop');
}
function getStorage(query, defaultValue) {
    let store = localStorage.getItem(query);
    if (store === null) return defaultValue; else return store;
}
function getOptionMap() {
    return {
        "options": {
            "value": {
                "minSubtraction": getStorage("minSubtraction", 1),
                "maxSubtraction": getStorage("maxSubtraction", 15),
                "minAddition": getStorage("minAddition", 1),
                "maxAddition": getStorage("maxAddition", 8),
                "useZip": getStorage("useZip", 0),
                "bothAdditionSubtraction": getStorage("bothAdditionSubtraction", 0),
                "fileFormat": getStorage("fileFormat", "{FileName}.{FinalExtension}"),
                "enableLogging": getStorage("enableLogging", 0)
            }
        }
    }
}
function showDialog(dialogName, hidden) {
    if (hidden) document.getElementById(dialogName).style.visibility = "collapse"; else document.getElementById(dialogName).style.visibility = "visible";
    if (hidden) document.getElementById(dialogName).style.opacity = 0; else document.getElementById(dialogName).style.opacity = 1;
}
function saveSettings() {
    let options = getOptionMap();
    let randomKeys = Object.keys(options.options.value);
    for (let i = 0; i < randomKeys.length; i++) {
        console.log(randomKeys[i]);
        if (document.getElementById(randomKeys[i]).value != "") localStorage.setItem(randomKeys[i], document.getElementById(randomKeys[i]).value);
    }
    console.log(getOptionMap());
    showDialog("settingDialog", true);
}
function getZip() {
    if (JSZipLoaded == false) {
        let JSZipLoader = document.createElement("script");
        JSZipLoader.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
        JSZipLoader.integrity = "sha256-rMfkFFWoB2W1/Zx+4bgHim0WC7vKRVrq6FTeZclH1Z4=";
        JSZipLoader.setAttribute("crossorigin", "anonymous");
        JSZipLoader.onload = function() {
            localZip = new JSZip();
        }
        console.log(JSZipLoader);
        document.body.append(JSZipLoader);
        JSZipLoaded = true;
    } else {
        localZip = new JSZip();
    }
}
function setSettingValue() {
    let options = getOptionMap();
    let randomKeys = Object.keys(options.options.value);
    for (let i = 0; i < randomKeys.length; i++) {
        document.getElementById(randomKeys[i]).value = options.options.value[randomKeys[i]];
    }
    showDialog("settingDialog", false);
}
function getDate() {
    let date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
}
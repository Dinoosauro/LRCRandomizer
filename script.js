function convertFile(ReadFile) {
    for (let i = 0; i < ReadFile.length; i++) {
        if (ReadFile[i].indexOf("]") == -1) continue;
        let ReadChange = ReadFile[i].substring(0, ReadFile[i].indexOf("]"));
        let choosePlusOrMinus = randomInt(1, 3);
        let cutThis = randomInt(1, 15);
        console.log(choosePlusOrMinus + "->" + cutThis);
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
                if (!zeroTotal) composeNew[2] = 100 + composeNew[2] - cutThis; else composeNew [0,0,0];
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
        if (converrtThing[0].length == 1) converrtThing[0] = "0" + converrtThing[0];
        if (converrtThing[1].length == 1) converrtThing[1] = "0" + converrtThing[1];
        if (converrtThing[2].length == 1) converrtThing[2] = "0" + converrtThing[2];
        ReadFile[i] = "[" + converrtThing[0] + ":" + converrtThing[1] + "." + converrtThing[2] + "]" + ReadFile[i].substring(10);
    }
    return ReadFile.join("\n");
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function downloadFile(textContent, fileName) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([textContent], { type: "text/plain" }));
    a.download = fileName.substring(0, fileName.lastIndexOf(".")) + ".lrc";
    a.click();
}
function readLrc(fileId) {
    Array.from(fileId).forEach(inputItem => {
        let readFile = new FileReader();
        readFile.readAsText(inputItem);
        readFile.onload = function () {
            downloadFile(convertFile(readFile.result.split("\n")), inputItem.name);
        }
    });
}
function openFile() {
    let inputFile = document.getElementById("input");
    inputFile.addEventListener("change", function () {
        readLrc(inputFile.files)
    });
    inputFile.click();
}
function dropHandler(ev) {
    ev.preventDefault();
    changeDropNotice(false);
    if (ev.dataTransfer.items) {
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') readLrc([ev.dataTransfer.items[i].getAsFile()]); else readLrc(ev.dataTransfer.files[i]);
        };
    }
}
function dragOverHandler(ev) {
    ev.preventDefault();
}
function changeDropNotice(show) {
    if (show) document.getElementById('drophere').classList.add('ondrop'); else document.getElementById('drophere').classList.remove('ondrop');
}

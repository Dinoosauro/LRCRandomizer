<script lang="ts">
    import { onMount } from "svelte";
    import Card from "./lib/Card.svelte";
    import Header from "./lib/Header.svelte";
    import jszip, { file } from "jszip";
    import { get } from "svelte/store";
    let zip = new jszip();
    const [
        folderCheckboxId,
        fileSystemCheckboxId,
        zipCheckboxId,
        onlyLrcCheckboxId,
    ] = [
        `Checkbox-${Math.random().toString().substring(2)}`,
        `Checkbox-${Math.random().toString().substring(2)}`,
        `Checkbox-${Math.random().toString().substring(2)}`,
        `Checkbox-${Math.random().toString().substring(2)}`,
    ];
    /**
     * The Object that contains the current minimum and maximum both for the addition and the subtraction
     */
    const secondsTimeout = {
        "+Max": localStorage.getItem("LRCRandomizer-+Max") ?? "10",
        "+Min": localStorage.getItem("LRCRandomizer-+Min") ?? "1",
        "-Max": localStorage.getItem("LRCRandomizer--Max") ?? "10",
        "-Min": localStorage.getItem("LRCRandomizer--Min") ?? "1",
    };
    /**
     * Get if a Checkbox should be checked or not, by checking the value in the LocalStorage
     * @param end the identifier of that resource, omitting the `LRCRandomizer-` part
     */
    function checkBoolLocalValue(end: string) {
        return localStorage.getItem(`LRCRandomizer-${end}`) === "a";
    }
    /**
     * Update the value of a boolean in the LocalStorage
     * @param e the Event of the checkbox
     * @param end the identifier of that resource, omitting the `LRCRandomizer-` part
     */
    function setBoolLocalValue(e: Event, end: string) {
        localStorage.setItem(
            `LRCRandomizer-${end}`,
            (e.target as HTMLInputElement).checked ? "a" : "b",
        );
    }
    let [isFolderPreferred, isFSPreferred, isZipPreferred] = [
        checkBoolLocalValue(`LocalFolder`),
        checkBoolLocalValue(`FileSystem`),
        checkBoolLocalValue(`ZipFile`),
    ];
    let checkOnlyLrc = localStorage.getItem("LRCRandomizer-OnlyLrc") !== "b";
    let signsToUse = localStorage.getItem("LRCRandomizer-AllowedSigns") ?? "+-";
    let fileStructure =
        localStorage.getItem("LRCRandomizer-OutputSyntax") ??
        "${DirectoryName}";
    $: {
        // Save changes to properties in the LocalStorage
        for (let [key, value] of [
            ["LRCRandomizer-AllowedSigns", signsToUse],
            ["LRCRandomizer-OutputSyntax", fileStructure],
        ])
            localStorage.setItem(key, value);
        for (let key in secondsTimeout)
            localStorage.setItem(
                `LRCRandomizer-${key}`,
                secondsTimeout[key as "+Max"],
            );
    }
    /**
     * Randomize a number, by adding or subtracting a random number
     * @param number the number to randomize
     */
    function randomize(number: number) {
        let sign =
            signsToUse === "+-"
                ? Math.random() > 0.5
                    ? "+"
                    : "-"
                : signsToUse;
        let max = +secondsTimeout[`${sign as "+" | "-"}Max`] * 10;
        let min = +secondsTimeout[`${sign as "+" | "-"}Min`] * 10;
        return (
            number + +`${sign}${Math.floor(Math.random() * (max - min) + min)}`
        );
    }
    /**
     * Adapt the string so that it has two characters
     * @param source the strnig to adapt
     */
    function intelliFormat(source: number | string) {
        return `${source.toString().length === 1 ? "0" : ""}${source.toString().length === 3 ? source.toString().substring(0, 2) : source}`;
    }
    /**
     * Convert the LRC file by randomizing the milliseconds
     * @param content the string of the LRC file
     */
    function convertFile(content: string) {
        return new Promise<string>((resolve) => {
            let lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                if (
                    lines[i].indexOf("]") === -1 ||
                    isNaN(+lines[i].substring(1, 2))
                )
                    continue;
                /**
                 * The string that contains the `mm:ss.xx` indicator of the LRC file
                 */
                let getTime = lines[i].substring(lines[i].indexOf("[") + 1);
                getTime = getTime.substring(0, getTime.indexOf("]"));
                const date = new Date(0);
                date.setMinutes(+getTime.substring(0, getTime.indexOf(":")));
                let seconds = getTime.substring(getTime.indexOf(":") + 1);
                if (seconds.indexOf(".") !== -1) {
                    seconds = seconds.substring(0, seconds.indexOf("."));
                    date.setMilliseconds(
                        +`${getTime.substring(getTime.indexOf(".") + 1)}0`,
                    );
                }
                date.setSeconds(+seconds);
                const newMs = randomize(date.getTime()); // Randomize the milliseconds by adding, or subtracting a random amount
                const outputDate = new Date(newMs);
                lines[i] =
                    `[${intelliFormat(Math.floor(newMs / 1000 / 60))}:${intelliFormat(outputDate.getSeconds())}.${intelliFormat(outputDate.getMilliseconds() < 100 ? `0${outputDate.getMilliseconds()}` : outputDate.getMilliseconds().toString().substring(0, 2))}]${lines[i].substring(lines[i].indexOf("]") + 1)}`;
            }
            resolve(lines.join("\n"));
        });
    }
    /**
     * Download the content
     * @param content the Blob file to download
     * @param name the suggested file name or file path
     * @param handle if a FileSystemDirectoryHandle is provided, a new file (and folder structure) will be created. Otherwise, if a FileSystemFileHandle is passed, the file will be written in that handle. By leaving this field as undefined, the File System API won't be used
     * @param forceDownload force downloading with a link
     */
    async function downloadFile(
        content: Blob,
        name: string,
        handle?: FileSystemDirectoryHandle | FileSystemFileHandle,
        forceDownload?: boolean,
    ) {
        if (isZipPreferred && !forceDownload) {
            zip.file(name, content, { createFolders: true });
            return;
        } else if (handle !== undefined) {
            if (handle instanceof FileSystemDirectoryHandle) {
                const splitFile = name.split("/");
                const fileName = splitFile.pop() ?? "";
                for (let folder of splitFile)
                    handle = await (
                        handle as FileSystemDirectoryHandle
                    ).getDirectoryHandle(folder, { create: true });
                handle = await handle.getFileHandle(fileName, { create: true });
            }
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
            return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = name;
        a.click();
    }
    /**
     * Download the current .zip file, and create a new, empty one
     */
    async function downloadZipFile() {
        downloadFile(
            await zip.generateAsync({ type: "blob" }),
            `LRCRandomizer-${Date.now()}.zip`,
            undefined,
            true,
        );
        zip = new jszip();
    }
    /**
     * Get a FileSystemFileHandle or a FileSystemDirectoryHandle, and continue with the randomization process
     */
    async function fileSystemHandle() {
        let handle: FileSystemFileHandle | FileSystemDirectoryHandle;
        /**
         * The array that'll contain the file to read, and the relative path where the file is located
         */
        let fileContent: { file: File; path: string }[] = [];
        if (isFolderPreferred) {
            // Get Directory Picker
            handle = await window.showDirectoryPicker({
                id: `LRCRandomizer-SourceFilePicker`,
            });
            /**
             * Get all the files in a directory, and also in the subdirectories
             * @param handle the FileSystemDirectoryHandle where the files will be picked
             * @param directory the current directory location
             */
            async function getFiles(
                handle: FileSystemDirectoryHandle,
                directory: string,
            ) {
                for await (const entry of handle.values())
                    entry.kind === "file"
                        ? fileContent.push({
                              file: await (
                                  await handle.getFileHandle(entry.name)
                              ).getFile(),
                              path: `${directory}${entry.name}`,
                          })
                        : await getFiles(
                              await handle.getDirectoryHandle(entry.name),
                              (directory = `${directory}${entry.name}/`),
                          );
            }
            await getFiles(handle, "");
        } else {
            // Choose multiple files
            for (const handle of await window.showOpenFilePicker({
                id: `LRCRandomizer-SourceFilePicker`,
                multiple: true,
            }))
                fileContent.push({
                    file: await handle.getFile(),
                    path: handle.name,
                });
        }
        if (checkOnlyLrc)
            fileContent = fileContent.filter((e) => e.path.endsWith("lrc")); // Delete all the files that don't end with ".lrc" from the array, if the user wants to
        if (fileContent.length !== 1) {
            // Multiple files are selected: write the output files in a directory
            const outputPicker = isZipPreferred
                ? undefined
                : await window.showDirectoryPicker({
                      id: `LRCRandomizer-OutputFilePicker`,
                      mode: "readwrite",
                  }); // If the user wants to save a zip file, don't pick a directory, since it'll be downloaded later with a link
            for (let { file, path } of fileContent)
                await downloadFile(
                    new Blob([await convertFile(await file.text())]),
                    getFileName(path),
                    outputPicker,
                );
        } else {
            const outputPicker = isZipPreferred
                ? undefined
                : await window.showSaveFilePicker({
                      id: `LRCRandomizer-OutputFilePicker`,
                      suggestedName: fileContent[0].path.split("/").pop(),
                  }); // Just like before, but in this case a single file is selected
            await downloadFile(
                new Blob([await convertFile(await fileContent[0].file.text())]),
                outputPicker?.name ?? getFileName(fileContent[0].path),
                outputPicker,
            );
        }
        isZipPreferred && downloadZipFile(); // If the user wants to save everything in a zip file, now it's the time to download it
    }
    /**
     * Get the output file name
     * @param path the ${DirectoryPath}
     */
    function getFileName(path: string) {
        return fileStructure
            .replaceAll("${DirectoryName}", path)
            .replaceAll(
                "${FileName}",
                path.split("/").pop() ??
                    `${Math.random().toString().substring(2)}.lrc`,
            )
            .replaceAll("${Dollar}", "$");
    }
    /**
     * Convert a File array of LRC file and download it
     * @param files the files to convert
     */
    async function inputFileManager(files: FileList | File[]) {
        for (let file of files) {
            (file.name.endsWith(".lrc") || !checkOnlyLrc) &&
                (await downloadFile(
                    new Blob([await convertFile(await file.text())]),
                    getFileName(
                        (file.webkitRelativePath ?? "") === ""
                            ? file.name
                            : file.webkitRelativePath,
                    ),
                ));
        }
        isZipPreferred && downloadZipFile();
    }
    /**
     * Convert files theat were dropped by the user
     * @param e the DragEvent
     */
    function dropHandler(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer?.items &&
            inputFileManager(
                Array.from(e.dataTransfer.items)
                    .map((e) => e.getAsFile())
                    .filter((e) => e !== null) as File[],
            );
        hoverThing.style.display = "none";
    }
    onMount(() => {
        if ("launchQueue" in window) {
            // Check if the user has opened files from the system's file picker
            (window.launchQueue as any).setConsumer(
                async (launchParams: any) => {
                    const arr: File[] = [];
                    for (let item of launchParams.files)
                        arr.push(await item.getFile());
                    inputFileManager(arr);
                },
            );
        }
    });
    /**
     * The div that will become visible when the user tries to drop a file
     */
    let hoverThing: HTMLDivElement;
    /**
     * If true, the "Useful info" tab will be hidden
     */
    let showUsefulInfo =
        localStorage.getItem("LRCRandomizer-ShowBottomCard") !==
        new Date().toDateString();
</script>

<svelte:document
    on:drop={dropHandler}
    on:dragover={(e) => e.preventDefault()}
    on:dragenter={() => (hoverThing.style.display = "block")}
    on:dragleave={() => (hoverThing.style.display = "none")}
/>
<Header></Header><br /><br />
<div class="adaptiveWidth">
    <div class="adaptiveFlex">
        <Card>
            <h2>Open a file:</h2>
            <i>You can also drag and drop files!</i><br /><br />
            <div class="flex hcenter">
                <input
                    bind:checked={isFolderPreferred}
                    type="checkbox"
                    id={folderCheckboxId}
                    on:change={(e) => setBoolLocalValue(e, "LocalFolder")}
                /><label for={folderCheckboxId}>Pick a folder</label>
            </div>
            <br />
            {#if window.showDirectoryPicker !== undefined}
                <div class="flex hcenter">
                    <input
                        id={fileSystemCheckboxId}
                        type="checkbox"
                        bind:checked={isFSPreferred}
                        on:change={(e) => setBoolLocalValue(e, "FileSystem")}
                    /><label for={fileSystemCheckboxId}
                        >Use the File System API</label
                    >
                </div>
                <br />
            {/if}
            <div class="flex hcenter">
                <input
                    id={zipCheckboxId}
                    type="checkbox"
                    bind:checked={isZipPreferred}
                    on:change={(e) => setBoolLocalValue(e, "ZipFile")}
                /><label for={zipCheckboxId}
                    >Zip file using the <a
                        target="_blank"
                        href="https://github.com/Stuk/jszip">JSZip library</a
                    ></label
                >
            </div>
            <br />
            <div class="flex hcenter">
                <input
                    type="checkbox"
                    on:change={(e) => setBoolLocalValue(e, "OnlyLrc")}
                    id={onlyLrcCheckboxId}
                    bind:checked={checkOnlyLrc}
                />
                <label for={onlyLrcCheckboxId}
                    >Allow only files that end with ".lrc"</label
                >
            </div>
            <br /><br />
            <button
                on:click={async () => {
                    if (!isFSPreferred) {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.webkitdirectory = isFolderPreferred;
                        input.onchange = async () =>
                            input.files && inputFileManager(input.files);
                        input.click();
                    } else fileSystemHandle();
                }}>Open file picker</button
            >
        </Card>
        <Card>
            <h2>Conversion options:</h2>
            <Card type={1}>
                <h3>File name:</h3>
                <p>
                    You can put <code>$&lbrace;DirectoryName&rbrace;</code> for
                    the relative path; <code>$&lbrace;FileName&rbrace;</code>
                    for the file name and
                    <code>$&lbrace;Dollar&rbrace;</code> for the $ sign.<br />
                    {#if window.navigator.platform.startsWith("Win")}
                        Note that, if you want to create a folder, you must use
                        the
                        <code>&sol;</code> even if you're on Windows.
                    {/if}
                </p>
                <input
                    type="text"
                    bind:value={fileStructure}
                    style="width: calc(100% - 20px)"
                />
            </Card><br />
            <Card type={1}>
                <h3>Addition/Subtraction:</h3>
                <select bind:value={signsToUse}>
                    <option value="+-"
                        >Allow both addition and subtraction</option
                    >
                    <option value="+">Allow only addition</option>
                    <option value="-">Allow only subtraction</option>
                </select><br /><br />
                {#each ["+", "-"] as sign}
                    <div class="selection">
                        <label>{sign === "+" ? "Add" : "Subtract"} from</label
                        ><input
                            type="number"
                            bind:value={secondsTimeout[`${sign}Min`]}
                            style="width: 40px"
                        /><label>to</label><input
                            type="number"
                            bind:value={secondsTimeout[`${sign}Max`]}
                            style="width: 40px;"
                        /><label>hundredths of seconds</label>
                    </div>
                    <br />
                {/each}
            </Card>
        </Card>
        {#if showUsefulInfo}
            <Card>
                <h2>Useful information:</h2>
                <Card type={1}>
                    <h3>Offline usage:</h3>
                    <p>
                        You can install this website as a Progressive Web App to
                        use it offline, and to open file directly from your OS's
                        file picker.<br /> If you prefer, you can also
                        <label
                            style="text-decoration: underline"
                            class="pointer"
                            on:click={async () => {
                                const req = await fetch(window.location.href);
                                downloadFile(
                                    await req.blob(),
                                    "LRCRandomizer.html",
                                    undefined,
                                    true,
                                );
                            }}
                        >
                            download this webpage as a HTML file
                        </label>
                    </p>
                </Card><br />
                <Card type={1}>
                    <h3>Credits:</h3>
                    <a href="https://github.com/Dinoosauro/LRCRandomizer"
                        >View on GitHub</a
                    >
                    <p>
                        Picture from <a
                            href="https://unsplash.com/it/@kevinmccutcheon"
                            >Kevin McCutcheon</a
                        >
                        on
                        <a
                            href="https://unsplash.com/it/foto/giradischi-nero-su-tavolo-di-legno-marrone-TcSckNRL9J8"
                            >Unsplash</a
                        >
                    </p>
                </Card><br />
                <button
                    on:click={() => {
                        localStorage.setItem(
                            "LRCRandomizer-ShowBottomCard",
                            new Date().toDateString(),
                        );
                        showUsefulInfo = false;
                    }}>Remove card for today</button
                >
            </Card>
        {/if}
    </div>
    <br /><br />
    <br />
</div>
<br /><br />
<img class="backgroundImg" src={"./background.webp"} />
<div
    class="backgroundImg drop"
    style="display: none;"
    bind:this={hoverThing}
></div>

<style>
    .adaptiveWidth {
        position: absolute;
        left: 5vw;
        width: 90vw;
    }
    .adaptiveFlex {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    .selection > * {
        margin-right: 10px;
    }
    .backgroundImg {
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        position: fixed;
        z-index: -1;
    }
</style>

interface DirectoryPicker {
    id?: string;
    mode?: string;
}
interface SaveFilePicker extends BaseFilePicker {
    id?: string;
}
interface Types {
    description: string;
    accept: {};
}
interface BaseFilePicker {
    suggestedName?: string;
    types?: Types[];
}
interface OpenFilePicker {
    id?: string,
    multiple?: boolean,
    types?: Types[]
}

declare global {
    interface Window {
        showDirectoryPicker: ({
            id,
            mode,
        }: DirectoryPicker) => Promise<FileSystemDirectoryHandle>;
        showSaveFilePicker: ({
            id,
            suggestedName,
            types,
        }: SaveFilePicker) => Promise<FileSystemFileHandle>;
        showOpenFilePicker: ({ id, multiple, types }: OpenFilePicker) => Promise<FileSystemFileHandle[]>
    }
}
export let useless = "";
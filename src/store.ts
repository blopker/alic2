import { createStore } from "solid-js/store";
import { type FileEntry, commands } from "./bindings";
import { compressImage } from "./compress";
import { getProfileActive } from "./settings/settingsData";

interface Store {
  files: FileEntry[];
  doubleCount: number;
  tripleCount: number;
}

const [store, setStore] = createStore<Store>({
  files: [],
  doubleCount: 0,
  tripleCount: 0,
});

async function addFile(path: string) {
  if (store.files.find((f) => f.path === path)) {
    return;
  }
  const file: FileEntry = {
    path,
    file: "",
    status: "Processing",
    size: null,
    original_size: null,
    ext: "",
    error: null,
  };
  setStore("files", (f) => [...f, file]);
  const fileResult = await commands.getFileInfo(file.path);
  if (fileResult.status === "error") {
    updateFile(file, { error: fileResult.error });
    return;
  }
  const update: Partial<FileEntry> = {
    file: fileResult.data.filename,
    ext: fileResult.data.extension,
    original_size: fileResult.data.size,
  };
  updateFile(file, update);
  updateFile(file, { status: "Compressing" });
  const compressResult = await compressImage(getProfileActive(), file);
  if (compressResult.status === "error") {
    updateFile(file, { error: compressResult.error });
    return;
  }
  updateFile(file, { status: "Complete" });
}

function updateFile(file: FileEntry, update: Partial<FileEntry>) {
  setStore("files", (f) => f.path === file.path, { ...file, ...update });
  // hack to make the table update
  setStore("files", [...store.files]);
}

function clearFiles() {
  setStore("files", []);
}

function removeFile(file: FileEntry) {
  setStore("files", (f) => f.filter((f) => f.path !== file.path));
}

export { store, addFile, updateFile, clearFiles, removeFile };

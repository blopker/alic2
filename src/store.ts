import { createStore } from "solid-js/store";
import { type FileEntry, commands } from "./bindings";
import { compressImage } from "./compress";
import { getProfileActive } from "./settings/settingsData";

type ReadonlyFileEntry = Readonly<FileEntry>;

interface Store {
  files: ReadonlyFileEntry[];
}

const [store, setStore] = createStore<Store>({
  files: [],
});

function newFileEntry(
  path: string,
  data: Partial<FileEntry>,
): ReadonlyFileEntry {
  return {
    path,
    file: data.file ?? "",
    status: data.status ?? "Processing",
    size: data.size ?? null,
    original_size: data.original_size ?? null,
    ext: data.ext ?? "",
    error: data.error ?? null,
    savings: data.savings ?? null,
  };
}

async function addFile(path: string) {
  if (store.files.find((f) => f.path === path)) {
    return;
  }

  let file = newFileEntry(path, {});
  setStore("files", (f) => [...f, file]);

  const fileResult = await commands.getFileInfo(path);
  if (fileResult.status === "error") {
    console.log(fileResult.error);
    updateFile(file, { error: fileResult.error, status: "Error" });
    return;
  }

  const update: Partial<FileEntry> = {
    file: fileResult.data.filename,
    ext: fileResult.data.extension,
    original_size: fileResult.data.size,
  };
  file = updateFile(file, update);

  file = updateFile(file, { status: "Compressing" });
  const compressResult = await compressImage(getProfileActive(), file);
  if (compressResult.status === "error") {
    console.log(compressResult.error);
    updateFile(file, { error: compressResult.error, status: "Error" });
    return;
  }

  const savings = file.original_size ?? 0 - compressResult.data.out_size;
  updateFile(file, {
    status: "Complete",
    size: compressResult.data.out_size,
    savings,
  });
}

function updateFile(
  file: FileEntry,
  update: Partial<FileEntry>,
): ReadonlyFileEntry {
  const newFile: ReadonlyFileEntry = { ...file, ...update };
  setStore("files", (f) => f.path === file.path, newFile);
  // hack to make the table update
  setStore("files", [...store.files]);
  return newFile;
}

function clearFiles() {
  setStore("files", []);
}

function removeFile(file: FileEntry) {
  setStore("files", (f) => f.filter((f) => f.path !== file.path));
}

export { store, addFile, updateFile, clearFiles, removeFile };

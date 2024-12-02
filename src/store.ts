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
    if (compressResult.error.error_type === "NotSmaller") {
      updateFile(file, {
        error: compressResult.error.error,
        status: "AlreadySmaller",
      });
      return;
    }
    updateFile(file, { error: compressResult.error.error, status: "Error" });
    return;
  }

  const out_size = compressResult.data.out_size;
  let savings = null;
  if (file.original_size !== null) {
    savings = ((file.original_size - out_size) / file.original_size) * 100;
  }
  file = updateFile(file, {
    status: "Complete",
    size: out_size,
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

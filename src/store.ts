import { createStore } from "solid-js/store";
import { type FileEntry, commands } from "./bindings";

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
  const filename = path.split("/").pop() ?? "";
  const ext = filename.split(".").pop() ?? "";
  const file: FileEntry = {
    path,
    file: filename,
    status: "Processing",
    size: null,
    savings: null,
    ext,
    error: null,
  };
  setStore("files", (f) => [...f, file]);
  const fileResult = await commands.getFileInfo(file);
  if (fileResult.status === "error") {
    console.log(fileResult.error);
    file.error = fileResult.error;
    updateFile(file);
    return;
  }
  updateFile(fileResult.data);
  const f = fileResult.data;
  f.status = "Compressing";
  updateFile(f);
  await commands.processImg({
    postfix: ".min",
    path: fileResult.data.path,
    jpeg_quality: 85,
    png_quality: 85,
    webp_quality: 85,
    gif_quality: 85,
    resize_width: 1000,
    resize_height: 1000,
    resize: false,
    convert_extension: null,
  });
  f.status = "Complete";
  updateFile(f);
}

function updateFile(file: FileEntry) {
  setStore("files", (f) => f.path === file.path, file);
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

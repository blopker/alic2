import {
  createSignal,
  createContext,
  useContext,
  type Accessor,
  type JSXElement,
} from "solid-js";
import type { FileEntry } from "./files";

interface FilesContextValue {
  addFile: (file: FileEntry) => void;
  removeFile: (file: FileEntry) => void;
  updateFile: (file: FileEntry) => void;
  clearFiles: () => void;
}

const FilesContext = createContext<
  [Accessor<FileEntry[]>, FilesContextValue] | undefined
>(undefined);

export function FilesProvider(props: {
  children: JSXElement;
  files?: FileEntry[];
}) {
  const [files, setFiles] = createSignal<FileEntry[]>(props.files ?? []);
  const fileValue: [Accessor<FileEntry[]>, FilesContextValue] = [
    files,
    {
      addFile: (file: FileEntry) => {
        if (files().find((f) => f.file === file.file)) {
          return;
        }
        setFiles((files) => [...files, file]);
      },
      removeFile: (file: FileEntry) => {
        setFiles((files) => files.filter((f) => f.file !== file.file));
      },
      updateFile: (file: FileEntry) => {
        setFiles((files) =>
          files.map((f) => (f.file === file.file ? file : f)),
        );
      },
      clearFiles: () => {
        setFiles([]);
      },
    },
  ];

  return (
    <FilesContext.Provider value={fileValue}>
      {props.children}
    </FilesContext.Provider>
  );
}

export function useFiles() {
  const value = useContext(FilesContext);
  if (value === undefined) {
    throw new Error("useFiles must be used within a FilesContext.Provider");
  }
  return value;
}

import type { FileEntry } from "./bindings";

export const files: FileEntry[] = [
  {
    path: "test/test.png",
    file: "test.png",
    status: "Processing",
    size: 100,
    savings: 2,
    ext: "png",
    error: null,
  },
  {
    path: "test/test.png",
    file: "test.png",
    status: "Compressing",
    size: null,
    savings: null,
    ext: "png",
    error: null,
  },
  {
    path: "test/test.png",
    file: "test.png",
    status: "Complete",
    size: null,
    savings: null,
    ext: "png",
    error: null,
  },
  {
    path: "test/test.png",
    file: "test.png",
    status: "Error",
    size: null,
    savings: null,
    ext: "png",
    error: "Ruhoh",
  },
];
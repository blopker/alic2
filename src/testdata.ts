import type { FileEntry } from "./bindings";

export const files: FileEntry[] = [
  {
    path: "test/test.png",
    file: "test.png",
    status: "Processing",
    size: 100,
    original_size: 2,
    ext: "png",
    error: null,
    savings: null,
  },
  {
    path: "test/test.png",
    file: "test.png",
    status: "Compressing",
    size: null,
    original_size: null,
    ext: "png",
    error: null,
    savings: 100,
  },
  {
    path: "test/test.png",
    file: "test.png",
    status: "Complete",
    size: null,
    original_size: null,
    ext: "png",
    error: null,
    savings: 100,
  },
  {
    path: "test/test.png",
    file: "test.png",
    status: "Error",
    size: null,
    original_size: null,
    ext: "png",
    error: "Ruhoh",
    savings: 100,
  },
];

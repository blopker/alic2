import { commands, type CompressResult } from "./bindings";
import type { FileEntry } from "./bindings";

export async function compressImage(file: FileEntry): Promise<CompressResult> {
  const res = await commands.processImg({
    postfix: ".min",
    path: file.path,
    resize: true,
    resize_width: 1000,
    resize_height: 1000,
    jpeg_quality: 80,
    png_quality: 80,
    webp_quality: 80,
    gif_quality: 80,
    convert_extension: null,
  });
  if (res.status === "error") {
    throw new Error(res.error);
  }
  return res.data;
}

// export interface Parameters {
//   path: string;
//   postfix: string;
//   resize: boolean;
//   resize_width: number;
//   resize_height: number;
//   jpeg_quality: number;
//   png_quality: number;
//   webp_quality: number;
//   gif_quality: number;
//   convert_extension: ImageType | null;
// }

// export interface CompressResult {
//   path: string;
//   out_path: string;
//   result: string;
// }

// export enum ImageType {
//   JPEG = "JPEG",
//   PNG = "PNG",
//   WEBP = "WEBP",
//   GIF = "GIF",
//   TIFF = "TIFF",
// }

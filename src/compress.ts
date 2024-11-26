import { type CompressResult, commands } from "./bindings";
import type { FileEntry, ProfileData } from "./bindings";

export async function compressImage(
  profile: ProfileData,
  file: FileEntry,
): Promise<CompressResult> {
  const res = await commands.processImg(profile, file.path);
  if (res.status === "error") {
    throw new Error(res.error);
  }
  return res.data;
}

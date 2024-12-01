import { type CompressResult, commands } from "./bindings";
import type { FileEntry, ProfileData, Result } from "./bindings";

export async function compressImage(
  profile: ProfileData,
  file: FileEntry,
): Promise<Result<CompressResult, string>> {
  return await commands.processImg(profile, file);
}

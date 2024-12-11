function toHumanReadableSize(size?: number | null) {
  if (!size) {
    return "?";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / 1024 ** i).toFixed(1)} ${["B", "kB", "MB", "GB"][i]}`;
}

export { toHumanReadableSize };

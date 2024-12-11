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

class Semaphore {
  private running = 0;
  private queue: (() => void)[] = [];

  constructor(private maxConcurrent: number) {}

  async acquire(): Promise<void> {
    if (this.running >= this.maxConcurrent) {
      return new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }
    this.running++;
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  }
}

export { toHumanReadableSize, Semaphore };

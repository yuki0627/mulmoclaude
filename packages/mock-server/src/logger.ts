import { appendFileSync } from "fs";

export interface MockLogger {
  info(msg: string): void;
  verbose(msg: string): void;
  raw(msg: string): void;
}

export function createLogger(verbose: boolean, logFile?: string): MockLogger {
  function timestamp(): string {
    return new Date().toISOString().slice(11, 23);
  }

  function writeToFile(line: string): void {
    if (!logFile) return;
    try {
      appendFileSync(logFile, line + "\n");
    } catch {
      // Best-effort — don't crash on log write failure
    }
  }

  return {
    info(msg: string): void {
      const line = `[mock] ${timestamp()} ${msg}`;
      console.log(line);
      writeToFile(line);
    },
    verbose(msg: string): void {
      const line = `[mock] ${msg}`;
      if (verbose) console.log(line);
      // Always write to log file regardless of --verbose flag
      writeToFile(line);
    },
    raw(msg: string): void {
      const line = `[mock] ${msg}`;
      console.log(line);
      writeToFile(line);
    },
  };
}

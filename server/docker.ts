import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const IMAGE_NAME = "mulmoclaude-sandbox";

let _dockerEnabled: boolean | null = null;

export async function isDockerAvailable(): Promise<boolean> {
  if (process.env.DISABLE_SANDBOX === "1") return false;
  if (_dockerEnabled !== null) return _dockerEnabled;
  try {
    await execFileAsync("docker", ["info"], { timeout: 5000 });
    _dockerEnabled = true;
  } catch {
    _dockerEnabled = false;
  }
  return _dockerEnabled;
}

export async function ensureSandboxImage(): Promise<void> {
  try {
    await execFileAsync("docker", ["image", "inspect", IMAGE_NAME]);
  } catch {
    console.log(
      "[sandbox] Building sandbox image (first time only, may take a minute)...",
    );
    await execFileAsync(
      "docker",
      ["build", "-t", IMAGE_NAME, "-f", "Dockerfile.sandbox", "."],
      { cwd: process.cwd() },
    );
    console.log("[sandbox] Sandbox image built.");
  }
}

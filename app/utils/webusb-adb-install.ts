/**
 * WebUSB ADB install/uninstall utilities for CYOD scans.
 *
 * Uses the persisted @yume-chan/adb Adb instance from CyodAdbSessionService
 * to push the patched APK to the device and install it — no Mercer server
 * required.
 */

type AdbLike = {
  subprocess: {
    spawnAndWaitLegacy(args: string[]): Promise<string>;
  };
  sync(): Promise<{
    write(
      path: string,
      data: ReadableStream<Uint8Array> | Uint8Array,
      mode?: number,
      mtime?: number
    ): Promise<void>;
    [Symbol.asyncDispose]?: () => Promise<void>;
    dispose?(): Promise<void>;
  }>;
};

const TMP_APK_PATH = '/data/local/tmp/cyod_install.apk';

export type InstallProgress =
  | { stage: 'downloading'; percent: number }
  | { stage: 'pushing'; percent: number }
  | { stage: 'installing' }
  | { stage: 'done' };

export type InstallOptions = {
  onProgress?: (progress: InstallProgress) => void;
};

/**
 * Download the patched APK from `apkUrl`, push it to the device via ADB sync,
 * then install it with `pm install -r -t`.
 */
export async function installApkViaWebUsb(
  adb: AdbLike,
  apkUrl: string,
  packageName: string,
  options: InstallOptions = {}
): Promise<void> {
  const { onProgress } = options;

  // 1. Fetch APK bytes
  onProgress?.({ stage: 'downloading', percent: 0 });

  const response = await fetch(apkUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch APK: ${response.status} ${response.statusText}`);
  }

  const contentLength = parseInt(response.headers.get('content-length') ?? '0', 10);
  const apkBytes = await _readWithProgress(response, contentLength, (percent) => {
    onProgress?.({ stage: 'downloading', percent });
  });

  onProgress?.({ stage: 'pushing', percent: 0 });

  // 2. Push APK to device via ADB sync
  const sync = await adb.sync();
  try {
    await sync.write(TMP_APK_PATH, apkBytes);
  } finally {
    if (sync[Symbol.asyncDispose]) {
      await sync[Symbol.asyncDispose]?.();
    } else if (sync.dispose) {
      await sync.dispose();
    }
  }

  onProgress?.({ stage: 'installing' });

  // 3. First uninstall any existing version (different cert = update blocked)
  try {
    await adb.subprocess.spawnAndWaitLegacy(['pm', 'uninstall', packageName]);
  } catch {
    // Not installed — ignore
  }

  // 4. Install
  const installOutput = await adb.subprocess.spawnAndWaitLegacy([
    'pm', 'install', '-r', '-t', TMP_APK_PATH,
  ]);

  if (!installOutput.includes('Success')) {
    throw new Error(`pm install failed: ${installOutput.trim()}`);
  }

  // 5. Clean up temp file
  try {
    await adb.subprocess.spawnAndWaitLegacy(['rm', '-f', TMP_APK_PATH]);
  } catch {
    // Non-fatal
  }

  onProgress?.({ stage: 'done' });
}

/** Uninstall a package by name. Does not throw if not installed. */
export async function uninstallApkViaWebUsb(
  adb: AdbLike,
  packageName: string
): Promise<void> {
  try {
    await adb.subprocess.spawnAndWaitLegacy(['pm', 'uninstall', packageName]);
  } catch {
    // Not installed — ignore
  }
}

/** Launch an app by package name via monkey. */
export async function launchAppViaWebUsb(
  adb: AdbLike,
  packageName: string
): Promise<void> {
  await adb.subprocess.spawnAndWaitLegacy([
    'monkey', '-p', packageName, '-c', 'android.intent.category.LAUNCHER', '1',
  ]);
}

async function _readWithProgress(
  response: Response,
  totalBytes: number,
  onPercent: (percent: number) => void
): Promise<Uint8Array> {
  if (!response.body) {
    const buf = await response.arrayBuffer();
    onPercent(100);
    return new Uint8Array(buf);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (totalBytes > 0) {
      onPercent(Math.round((received / totalBytes) * 100));
    }
  }

  onPercent(100);

  // Concatenate chunks
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

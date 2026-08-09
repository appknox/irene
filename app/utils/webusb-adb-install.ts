import type { Adb } from '@yume-chan/adb';

type AdbSyncWriteFile = Parameters<
  Awaited<ReturnType<Adb['sync']>>['write']
>[0]['file'];

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
  adb: Adb,
  apkUrl: string,
  packageName: string,
  options: InstallOptions = {}
): Promise<void> {
  const { onProgress } = options;

  onProgress?.({ stage: 'downloading', percent: 0 });

  const response = await fetch(apkUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch APK: ${response.status} ${response.statusText}`
    );
  }

  const contentLength = parseInt(
    response.headers.get('content-length') ?? '0',
    10
  );
  const apkBytes = await readWithProgress(
    response,
    contentLength,
    (percent) => {
      onProgress?.({ stage: 'downloading', percent });
    }
  );

  onProgress?.({ stage: 'pushing', percent: 0 });

  const sync = await adb.sync();
  try {
    await sync.write({
      filename: TMP_APK_PATH,
      file: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(apkBytes);
          controller.close();
        },
      }) as unknown as AdbSyncWriteFile,
    });
  } finally {
    await sync.dispose();
  }

  onProgress?.({ stage: 'installing' });

  // A different signing cert blocks an in-place update, so remove first.
  try {
    await adb.subprocess.noneProtocol.spawnWaitText([
      'pm',
      'uninstall',
      packageName,
    ]);
  } catch {
    // not installed
  }

  const installOutput = await adb.subprocess.noneProtocol.spawnWaitText([
    'pm',
    'install',
    '-r',
    '-t',
    TMP_APK_PATH,
  ]);

  if (!installOutput.includes('Success')) {
    throw new Error(`pm install failed: ${installOutput.trim()}`);
  }

  try {
    await adb.subprocess.noneProtocol.spawnWaitText(['rm', '-f', TMP_APK_PATH]);
  } catch {
    // leftover temp file is harmless
  }

  onProgress?.({ stage: 'done' });
}

/** Uninstall a package by name. Does not throw if not installed. */
export async function uninstallApkViaWebUsb(
  adb: Adb,
  packageName: string
): Promise<void> {
  try {
    await adb.subprocess.noneProtocol.spawnWaitText([
      'pm',
      'uninstall',
      packageName,
    ]);
  } catch {
    // not installed
  }
}

/** Launch an app by package name via monkey. */
export async function launchAppViaWebUsb(
  adb: Adb,
  packageName: string
): Promise<void> {
  await adb.subprocess.noneProtocol.spawnWaitText([
    'monkey',
    '-p',
    packageName,
    '-c',
    'android.intent.category.LAUNCHER',
    '1',
  ]);
}

async function readWithProgress(
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
    if (done) {
      break;
    }

    chunks.push(value);
    received += value.length;
    if (totalBytes > 0) {
      onPercent(Math.round((received / totalBytes) * 100));
    }
  }

  onPercent(100);

  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

import RequestWrapper from '../Actions/api/request.wrapper';
import { API_ROUTES, resolveRoute } from '../support/api.routes';
import {
  SCAN_RUNNING_STATUSES,
  SCAN_STOPPED_STATUSES,
} from '../support/constants';
const POLL_INTERVAL = 5000;
const POLL_TIMEOUT = 120000; // 2 minutes

export async function waitForDeviceAvailable(
  wrapper: RequestWrapper,
  projectId: number
): Promise<void> {
  const startTime = Date.now();

  while (true) {
    const response = await wrapper.get({
      endpoint: `${resolveRoute(API_ROUTES.availableManualDevices.route, projectId)}?limit=10&offset=0&platform_version_min=4.4`,
    });
    const body = await response.json();
    const freeDevice = body.results.find(
      (d: Record<string, unknown>) =>
        d.state === 'available' && d.is_reserved === false
    );

    if (freeDevice) {
      console.log(`[Utils] Device ${freeDevice.device_identifier} is free `);
      return;
    }

    if (Date.now() - startTime > POLL_TIMEOUT)
      throw new Error('[Utils] Timeout: No device available after 2 minutes');

    console.log('[Utils] Waiting for device to free up... 5s');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

export async function waitForScanRunning(
  wrapper: RequestWrapper,
  fileId: number
): Promise<void> {
  const startTime = Date.now();

  while (true) {
    const response = await wrapper.get({
      endpoint: resolveRoute(API_ROUTES.lastManualDynamicScan.route, fileId),
    });
    const body = await response.json();

    const status = body.status as number;
    if (SCAN_RUNNING_STATUSES.includes(status)) {
      console.log(`[Utils] Scan running ${body.status_display}`);
      return;
    }

    if (Date.now() - startTime > POLL_TIMEOUT)
      throw new Error('[Utils] Timeout: Scan did not start after 2 minutes');

    console.log('[Utils] Scan still processing... 5s');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

export async function waitForScanStopped(
  wrapper: RequestWrapper,
  fileId: number
): Promise<void> {
  const startTime = Date.now();

  while (true) {
    const response = await wrapper.get({
      endpoint: resolveRoute(API_ROUTES.lastManualDynamicScan.route, fileId),
    });

    // 404 means no active scan → safe to start new one
    if (response.status() === 404) {
      console.log('[Utils] No active scan — safe to start new one');
      return;
    }

    const body = await response.json();
    const status = body.status as number;

    if (SCAN_STOPPED_STATUSES.includes(status)) {
      console.log(`[Utils] Scan stopped ${body.status_display}`);
      await new Promise((r) => setTimeout(r, 5000));
      return;
    }
    if (Date.now() - startTime > POLL_TIMEOUT)
      throw new Error('[Utils] Timeout: Scan did not stop after 2 minutes');

    console.log('[Utils] Scan still stopping... 5s');
    await new Promise((r) => setTimeout(r, 5000));
    console.log(
      `[Utils] Current scan status: ${body.status} - ${body.status_display}`
    );
  }
}

import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';
import {
  waitForDeviceAvailable,
  waitForScanRunning,
  waitForScanStopped,
} from '../../utils/dynamic-scan.utils';

let wrapper: RequestWrapper;

test.describe.serial('Dynamic Scan API', () => {
  test.setTimeout(120000);
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('GET ds_manual_device_preference — returns current preference', async () => {
    await allure.epic('Dynamic Scan');
    await allure.feature('Device Preference');
    await allure.story('User views current device preference');
    await allure.severity('normal');
    await allure.tags('dynamic-scan', 'smoke');

    const response = await allure.step('GET device preference', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(
          API_ROUTES.dsManualDevicePreference.route,
          state.profileId
        ),
      });
    });

    const body = await allure.step(
      'Validate status 200 and schema',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['id', 'ds_manual_device_selection'],
        });
      }
    );

    await allure.step('Validate preference schema', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
        ds_manual_device_selection: { type: 'number', required: true },
        ds_manual_device_selection_display: { type: 'string', required: true },
      });
    });
  });

  test('GET available_manual_devices — returns device list', async () => {
    await allure.epic('Dynamic Scan');
    await allure.feature('Device List');
    await allure.story('User views available devices');
    await allure.severity('normal');
    await allure.tags('dynamic-scan', 'smoke');

    const response = await allure.step('GET available devices', async () => {
      return await wrapper.get({
        endpoint: `${resolveRoute(API_ROUTES.availableManualDevices.route, state.projectId)}?limit=5&offset=0&platform_version_min=4.4`,
      });
    });

    const body = await allure.step('Validate paginated response', async () => {
      return await ResponseValidator.validatePaginated(response);
    });

    await allure.step('Validate device schema', async () => {
      const device = (body.results as Record<string, unknown>[])[0];
      SchemaValidator.validate(device, {
        id: { type: 'number', required: true },
        state: { type: 'string', required: true },
        device_identifier: { type: 'string', required: true },
        model: { type: 'string', required: true },
        platform_version: { type: 'string', required: true },
      });
    });
  });

  test('GET api_scan_options — returns API scan settings', async () => {
    await allure.epic('Dynamic Scan');
    await allure.feature('API Scan');
    await allure.story('User views API scan options');
    await allure.severity('normal');
    await allure.tags('dynamic-scan', 'api-scan', 'smoke');

    const response = await allure.step('GET API scan options', async () => {
      return await wrapper.get({
        endpoint: `${resolveRoute(API_ROUTES.apiScanOptions.route, state.profileId)}?id=${state.profileId}`,
      });
    });

    const body = await allure.step('Validate status 200', async () => {
      return await ResponseValidator.validate(response, {
        status: 200,
        requiredFields: ['id'],
      });
    });

    await allure.step('Validate schema', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
      });
    });
  });

  test.describe.serial('Flow 1 — Any available device with API scan', () => {
    let scanId: number;

    test('PUT preference — use any available device', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User sets device preference to any available');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('PUT device preference', async () => {
        return await wrapper.put({
          endpoint: resolveRoute(
            API_ROUTES.dsManualDevicePreference.route,
            state.profileId
          ),
          body: {
            ds_manual_device_selection: 0,
            ds_manual_device_identifier: '',
          },
        });
      });

      await allure.step('Validate status 200', async () => {
        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        expect(body.ds_manual_device_selection as number).toBe(0);
      });
    });

    test('POST dynamicscans — start scan with API capture', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User starts dynamic scan on any available device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step(
        'POST start dynamic scan',
        async () => {
          return await wrapper.post({
            endpoint: resolveRoute(API_ROUTES.dynamicScans.route, state.fileId),
            body: { mode: 0, enable_api_capture: true },
          });
        }
      );

      const body = await allure.step(
        'Validate status 201 and schema',
        async () => {
          return await ResponseValidator.validate(response, {
            status: 201,
            requiredFields: ['id', 'file', 'mode', 'status'],
          });
        }
      );

      await allure.step('Verify scan started and save scanId', async () => {
        SchemaValidator.validate(body, {
          id: { type: 'number', required: true },
          file: { type: 'number', required: true },
          mode: { type: 'number', required: true },
          status: { type: 'number', required: true },
        });
        expect(body.file as number).toBe(state.fileId);
        scanId = body.id as number;
      });
      await waitForScanRunning(wrapper, state.fileId);
    });

    test('GET last_manual_dynamic_scan — verify scan is active', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('Dynamic scan status is active after start');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'regression');

      const response = await allure.step(
        'GET last manual dynamic scan',
        async () => {
          return await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.lastManualDynamicScan.route,
              state.fileId
            ),
          });
        }
      );

      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify scan is active', async () => {
        expect(body.id as number).toBe(scanId);
        expect(body.file as number).toBe(state.fileId);
      });
    });

    test('DELETE dynamicscans — stop scan', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User stops dynamic scan');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('DELETE stop scan', async () => {
        return await wrapper.delete({
          endpoint: resolveRoute(API_ROUTES.dynamicScanById.route, scanId),
        });
      });

      await allure.step('Validate status 204', async () => {
        expect(response.status()).toBe(204);
      });

      await waitForDeviceAvailable(wrapper, state.projectId);

      await waitForScanStopped(wrapper, state.fileId);
    });
  });

  test.describe.serial('Flow 2 — Specific device with API scan', () => {
    let scanId: number;
    let deviceIdentifier: string;

    test('GET available devices — pick first available', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User picks a specific device');
      await allure.severity('normal');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('GET available devices', async () => {
        return await wrapper.get({
          endpoint: `${resolveRoute(API_ROUTES.availableManualDevices.route, state.projectId)}?limit=5&offset=0&platform_version_min=4.4`,
        });
      });

      const body = await allure.step(
        'Validate and get first device',
        async () => {
          return await ResponseValidator.validatePaginated(response);
        }
      );

      await allure.step('Save first available device identifier', async () => {
        const devices = body.results as Record<string, unknown>[];
        const availableDevice = devices.find((d) => d.state === 'available');
        expect(availableDevice).toBeDefined();
        deviceIdentifier = availableDevice!.device_identifier as string;
        console.log(`[Test] Using device: ${deviceIdentifier}`);
      });
    });

    test('PUT preference — use specific device', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User sets preference to specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step(
        'PUT specific device preference',
        async () => {
          return await wrapper.put({
            endpoint: resolveRoute(
              API_ROUTES.dsManualDevicePreference.route,
              state.profileId
            ),
            body: {
              ds_manual_device_selection: 1,
              ds_manual_device_identifier: deviceIdentifier,
            },
          });
        }
      );

      await allure.step('Validate status 200', async () => {
        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        expect(body.ds_manual_device_selection as number).toBe(1);
        expect(body.ds_manual_device_identifier as string).toBe(
          deviceIdentifier
        );
      });
    });

    test('POST dynamicscans — start scan on specific device', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User starts dynamic scan on specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step(
        'POST start dynamic scan',
        async () => {
          return await wrapper.post({
            endpoint: resolveRoute(API_ROUTES.dynamicScans.route, state.fileId),
            body: { mode: 0, enable_api_capture: true },
          });
        }
      );

      const body = await allure.step('Validate status 201', async () => {
        return await ResponseValidator.validate(response, {
          status: 201,
          requiredFields: ['id', 'file', 'mode', 'status'],
        });
      });

      await allure.step('Verify scan started and save scanId', async () => {
        expect(body.file as number).toBe(state.fileId);
        scanId = body.id as number;
      });
      await waitForScanRunning(wrapper, state.fileId);
    });

    test('GET last_manual_dynamic_scan — verify scan active', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('Dynamic scan is active on specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'regression');

      const response = await allure.step(
        'GET last manual dynamic scan',
        async () => {
          return await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.lastManualDynamicScan.route,
              state.fileId
            ),
          });
        }
      );

      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify scan is active', async () => {
        expect(body.id as number).toBe(scanId);
        expect(body.file as number).toBe(state.fileId);
      });
    });

    test('DELETE dynamicscans — stop scan', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User stops dynamic scan on specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('DELETE stop scan', async () => {
        return await wrapper.delete({
          endpoint: resolveRoute(API_ROUTES.dynamicScanById.route, scanId),
        });
      });

      await allure.step('Validate status 204', async () => {
        expect(response.status()).toBe(204);
      });
      await waitForDeviceAvailable(wrapper, state.projectId);
      await waitForScanStopped(wrapper, state.fileId);
    });

    test('PUT preference — reset to any available device', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('Reset device preference after test');
      await allure.severity('normal');
      await allure.tags('dynamic-scan', 'regression');

      await allure.step('PUT reset preference', async () => {
        await wrapper.put({
          endpoint: resolveRoute(
            API_ROUTES.dsManualDevicePreference.route,
            state.profileId
          ),
          body: {
            ds_manual_device_selection: 0,
            ds_manual_device_identifier: '',
          },
        });
      });
    });
  });

  test.describe
    .serial('Flow 3 — Any available device with API scan OFF', () => {
    let scanId: number;

    test('PUT preference — use any available device with API scan OFF', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User sets device preference to any available');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('PUT device preference', async () => {
        return await wrapper.put({
          endpoint: resolveRoute(
            API_ROUTES.dsManualDevicePreference.route,
            state.profileId
          ),
          body: {
            ds_manual_device_selection: 0,
            ds_manual_device_identifier: '',
          },
        });
      });

      await allure.step('Validate status 200', async () => {
        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        expect(body.ds_manual_device_selection as number).toBe(0);
      });
    });

    test('POST dynamicscans — start scan with API capture', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User starts dynamic scan on any available device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step(
        'POST start dynamic scan',
        async () => {
          return await wrapper.post({
            endpoint: resolveRoute(API_ROUTES.dynamicScans.route, state.fileId),
            body: { mode: 0, enable_api_capture: false },
          });
        }
      );

      const body = await allure.step(
        'Validate status 201 and schema',
        async () => {
          return await ResponseValidator.validate(response, {
            status: 201,
            requiredFields: ['id', 'file', 'mode', 'status'],
          });
        }
      );

      await allure.step('Verify scan started and save scanId', async () => {
        SchemaValidator.validate(body, {
          id: { type: 'number', required: true },
          file: { type: 'number', required: true },
          mode: { type: 'number', required: true },
          status: { type: 'number', required: true },
        });
        expect(body.file as number).toBe(state.fileId);
        scanId = body.id as number;
      });
      await waitForScanRunning(wrapper, state.fileId);
    });

    test('GET last_manual_dynamic_scan — verify scan is active', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('Dynamic scan status is active after start');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'regression');

      const response = await allure.step(
        'GET last manual dynamic scan',
        async () => {
          return await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.lastManualDynamicScan.route,
              state.fileId
            ),
          });
        }
      );

      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify scan is active', async () => {
        expect(body.id as number).toBe(scanId);
        expect(body.file as number).toBe(state.fileId);
      });
    });

    test('DELETE dynamicscans — stop scan', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User stops dynamic scan');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('DELETE stop scan', async () => {
        return await wrapper.delete({
          endpoint: resolveRoute(API_ROUTES.dynamicScanById.route, scanId),
        });
      });

      await allure.step('Validate status 204', async () => {
        expect(response.status()).toBe(204);
      });

      await waitForDeviceAvailable(wrapper, state.projectId);

      await waitForScanStopped(wrapper, state.fileId);
    });
  });

  test.describe.serial('Flow 4 — Specific device with API scan Off', () => {
    let scanId: number;
    let deviceIdentifier: string;

    test('GET available devices — pick first available', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User picks a specific device');
      await allure.severity('normal');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('GET available devices', async () => {
        return await wrapper.get({
          endpoint: `${resolveRoute(API_ROUTES.availableManualDevices.route, state.projectId)}?limit=5&offset=0&platform_version_min=4.4`,
        });
      });

      const body = await allure.step(
        'Validate and get first device',
        async () => {
          return await ResponseValidator.validatePaginated(response);
        }
      );

      await allure.step('Save first available device identifier', async () => {
        const devices = body.results as Record<string, unknown>[];
        const availableDevice = devices.find((d) => d.state === 'available');
        expect(availableDevice).toBeDefined();
        deviceIdentifier = availableDevice!.device_identifier as string;
        console.log(`[Test] Using device: ${deviceIdentifier}`);
      });
    });

    test('PUT preference — use specific device with API scan OFF', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User sets preference to specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step(
        'PUT specific device preference',
        async () => {
          return await wrapper.put({
            endpoint: resolveRoute(
              API_ROUTES.dsManualDevicePreference.route,
              state.profileId
            ),
            body: {
              ds_manual_device_selection: 1,
              ds_manual_device_identifier: deviceIdentifier,
            },
          });
        }
      );

      await allure.step('Validate status 200', async () => {
        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        expect(body.ds_manual_device_selection as number).toBe(1);
        expect(body.ds_manual_device_identifier as string).toBe(
          deviceIdentifier
        );
      });
    });

    test('POST dynamicscans — start scan on specific device with API scan OFF', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User starts dynamic scan on specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step(
        'POST start dynamic scan',
        async () => {
          return await wrapper.post({
            endpoint: resolveRoute(API_ROUTES.dynamicScans.route, state.fileId),
            body: { mode: 0, enable_api_capture: false },
          });
        }
      );

      const body = await allure.step('Validate status 201', async () => {
        return await ResponseValidator.validate(response, {
          status: 201,
          requiredFields: ['id', 'file', 'mode', 'status'],
        });
      });

      await allure.step('Verify scan started and save scanId', async () => {
        expect(body.file as number).toBe(state.fileId);
        scanId = body.id as number;
      });
      await waitForScanRunning(wrapper, state.fileId);
    });

    test('GET last_manual_dynamic_scan — verify scan active', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('Dynamic scan is active on specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'regression');

      const response = await allure.step(
        'GET last manual dynamic scan',
        async () => {
          return await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.lastManualDynamicScan.route,
              state.fileId
            ),
          });
        }
      );

      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify scan is active', async () => {
        expect(body.id as number).toBe(scanId);
        expect(body.file as number).toBe(state.fileId);
      });
    });

    test('DELETE dynamicscans — stop scan', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('User stops dynamic scan on specific device');
      await allure.severity('critical');
      await allure.tags('dynamic-scan', 'smoke');

      const response = await allure.step('DELETE stop scan', async () => {
        return await wrapper.delete({
          endpoint: resolveRoute(API_ROUTES.dynamicScanById.route, scanId),
        });
      });

      await allure.step('Validate status 204', async () => {
        expect(response.status()).toBe(204);
      });
      await waitForDeviceAvailable(wrapper, state.projectId);
      await waitForScanStopped(wrapper, state.fileId);
    });

    test('PUT preference — reset to any available device', async () => {
      await allure.epic('Dynamic Scan');
      await allure.feature('Manual DAST');
      await allure.story('Reset device preference after test');
      await allure.severity('normal');
      await allure.tags('dynamic-scan', 'regression');

      await allure.step('PUT reset preference', async () => {
        await wrapper.put({
          endpoint: resolveRoute(
            API_ROUTES.dsManualDevicePreference.route,
            state.profileId
          ),
          body: {
            ds_manual_device_selection: 0,
            ds_manual_device_identifier: '',
          },
        });
      });
    });
  });
});

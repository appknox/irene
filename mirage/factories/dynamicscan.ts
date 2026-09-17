// @ts-expect-error "trait" prop missing from miragejs
import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import type { ModelInstance, Server } from 'miragejs';

import ENUMS from 'irene/enums';

type UpdatableRecord = { update: (attrs: Record<string, unknown>) => void };

export const FARM_DEVICE_USED = {
  device_identifier: 'BXCRS21',
  platform: ENUMS.PLATFORM.ANDROID,
  vnc_mode: ENUMS.DEVICE_VNC_MODE.VNC,
  registration_source: ENUMS.DEVICE_REGISTRATION_SOURCE.FARM,
  scan_source: 'FARM',
  is_tablet: false,
};

export const PROXY_CYOD_DEVICE_USED = {
  device_identifier: 'emulator-5554',
  platform: ENUMS.PLATFORM.ANDROID,
  vnc_mode: ENUMS.DEVICE_VNC_MODE.SCRCPY,
  registration_source: ENUMS.DEVICE_REGISTRATION_SOURCE.PROXY,
  scan_source: 'PROXY_CYOD',
  bundle_id: 'com.example.app',
  android_download_url: 'https://example.com/patched.apk',
};

export const REMOTE_CYOD_DEVICE_USED = {
  device_identifier: 'user-iphone',
  platform: ENUMS.PLATFORM.IOS,
  vnc_mode: ENUMS.DEVICE_VNC_MODE.NONE,
  registration_source: ENUMS.DEVICE_REGISTRATION_SOURCE.WEBUSB,
  scan_source: 'REMOTE_CYOD',
  bundle_id: 'com.example.iosapp',
  ios_itms_url:
    'itms-services://?action=download-manifest&url=https://example.com/manifest.plist',
};

export default Factory.extend({
  id(i: number) {
    return i + 1;
  },

  file: null,
  package_name: faker.internet.domainName(),
  mode: faker.helpers.arrayElement(ENUMS.DYNAMIC_MODE.VALUES),
  mode_display: '',
  status: faker.helpers.arrayElement(ENUMS.DYNAMIC_SCAN_STATUS.VALUES),
  status_display: '',
  moriarty_dynamicscanrequest_id: () => faker.string.uuid(),
  moriarty_dynamicscan_id: () => faker.string.uuid(),
  moriarty_dynamicscan_token: () => faker.string.uuid(),
  started_by_user: null,
  stopped_by_user: null,
  created_on: () => faker.date.recent().toISOString(),
  ended_on: () => faker.date.recent().toISOString(),
  auto_shutdown_on: () => faker.date.recent().toISOString(),
  engine: faker.helpers.arrayElement(ENUMS.DYNAMIC_SCAN_ENGINE.VALUES),
  device_used: null,
  device_preference: null,
  error_code: '',
  error_message: '',

  withFarmDevice: trait({
    afterCreate(ds: UpdatableRecord) {
      ds.update({ device_used: FARM_DEVICE_USED });
    },
  }),

  withProxyCyodDevice: trait({
    afterCreate(ds: UpdatableRecord) {
      ds.update({ device_used: PROXY_CYOD_DEVICE_USED });
    },
  }),

  withRemoteCyodDevice: trait({
    afterCreate(ds: UpdatableRecord) {
      ds.update({ device_used: REMOTE_CYOD_DEVICE_USED });
    },
  }),

  scenarioUserRole: null,

  withUserRole: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        scenarioUserRole: server.create('scenario-user-role'),
      });
    },
  }),
});

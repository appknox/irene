// @ts-expect-error "trait" prop missing from miragejs typings
import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export const FARM_DEVICE_USED = {
  device_identifier: 'BXCRS21',
  platform: 0,
  vnc_mode: 1,
  registration_source: 0,
  scan_source: 'FARM',
  is_tablet: false,
};

export const PROXY_CYOD_DEVICE_USED = {
  device_identifier: 'emulator-5554',
  platform: 0,
  vnc_mode: 2,
  registration_source: 1,
  scan_source: 'PROXY_CYOD',
  bundle_id: 'com.example.app',
  android_download_url: 'https://example.com/patched.apk',
};

export const REMOTE_CYOD_DEVICE_USED = {
  device_identifier: 'user-iphone',
  platform: 1,
  vnc_mode: 0,
  registration_source: 2,
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
  device_used: null,
  device_preference: null,
  error_code: '',
  error_message: '',

  withFarmDevice: trait({
    afterCreate(ds: any) {
      ds.update({ device_used: FARM_DEVICE_USED });
    },
  }),

  withProxyCyodDevice: trait({
    afterCreate(ds: any) {
      ds.update({ device_used: PROXY_CYOD_DEVICE_USED });
    },
  }),

  withRemoteCyodDevice: trait({
    afterCreate(ds: any) {
      ds.update({ device_used: REMOTE_CYOD_DEVICE_USED });
    },
  }),
});

import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  api_scan: faker.datatype.boolean(),
  created_on: faker.date.recent().toString(),
  updated_on: faker.date.recent().toString(),
  expires_on: faker.date.recent().toString(),
  device_type: faker.random.arrayElement(ENUMS.DEVICE_TYPE.BASE_VALUES),
  dynamic_status: faker.random.arrayElement(ENUMS.DYNAMIC_STATUS.VALUES),

  platform: faker.random.arrayElement([
    ENUMS.PLATFORM.ANDROID,
    ENUMS.PLATFORM.IOS,
  ]),

  platform_version: faker.system.semver(),
  proxy_host: faker.internet.ip(),
  proxy_port: faker.internet.port(),
});

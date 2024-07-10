import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  api_scan: faker.datatype.boolean(),
  created_on: faker.date.recent().toString(),
  updated_on: faker.date.recent().toString(),
  ended_on: faker.date.recent().toString(),
  device_type: faker.helpers.arrayElement(ENUMS.DEVICE_TYPE.BASE_VALUES),
  status: faker.helpers.arrayElement(ENUMS.DYNAMIC_STATUS.VALUES),
  platform_version: faker.system.semver(),
  proxy_host: faker.internet.ip(),
  proxy_port: faker.internet.port(),
});

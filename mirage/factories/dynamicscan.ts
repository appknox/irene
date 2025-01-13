import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

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
});

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  is_latest: () => faker.datatype.boolean(),
  can_initiate_upload: () => faker.datatype.boolean(),
  created_on: () => faker.date.past().toISOString(),
  file_created_on: () => faker.date.past().toISOString(),

  app_scan_status: () =>
    faker.helpers.arrayElement(ENUMS.SK_APP_MONITORING_STATUS.BASE_VALUES),

  app_scan_status_display() {
    const app_status = this.app_scan_status as number;

    return ENUMS.SK_APP_MONITORING_STATUS.BASE_CHOICES.find(
      (c) => c.value === app_status
    )?.key;
  },

  version() {
    return faker.number.int();
  },

  version_code() {
    return faker.number.int();
  },
});

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export const SECURITY_FILE_FACTORY_DEF = {
  name() {
    return faker.company.name();
  },

  file_format_display() {
    return faker.helpers.arrayElement(['apk', 'ipa', 'aab']);
  },

  api_scan_status() {
    return faker.helpers.arrayElement(ENUMS.SCAN_STATUS.VALUES);
  },

  is_dynamic_done() {
    return faker.datatype.boolean();
  },

  is_static_done() {
    return faker.datatype.boolean();
  },

  manual() {
    return faker.helpers.arrayElement(ENUMS.MANUAL.VALUES);
  },
};

export default Factory.extend(SECURITY_FILE_FACTORY_DEF);

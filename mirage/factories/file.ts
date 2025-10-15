import { faker } from '@faker-js/faker';
import Base from './base';

import { RISK_COLOR_CODE } from 'irene/utils/constants';
import ENUMS from 'irene/enums';

export const FILE_FACTORY_DEF = {
  uuid: faker.number.int(),
  device_token: faker.number.int(),
  min_os_version: faker.number.int({ min: 16, max: 20 }),
  md5hash: faker.number.int(),
  sha1hash: faker.number.int(),
  report: faker.image.avatar(),
  manual: false,
  api_scan_progress: faker.number.int(),
  static_scan_progress: faker.number.int(),
  is_static_done: faker.datatype.boolean(),
  is_dynamic_done: faker.datatype.boolean(),
  is_manual_done: faker.datatype.boolean(),
  is_api_done: faker.datatype.boolean(),
  can_generate_report: faker.datatype.boolean(),

  risk_count_critical: () => faker.number.int(20),
  risk_count_high: () => faker.number.int(20),
  risk_count_low: () => faker.number.int(20),
  risk_count_medium: () => faker.number.int(20),
  risk_count_passed: () => faker.number.int(20),
  risk_count_unknown: () => faker.number.int(20),

  countRiskCritical: faker.number.int(20),
  countRiskHigh: faker.number.int(20),
  countRiskMedium: faker.number.int(20),
  countRiskLow: faker.number.int(20),
  countRiskNone: faker.number.int(20),
  countRiskUnknown: faker.number.int(20),

  version() {
    return faker.number.int();
  },

  version_code() {
    return faker.number.int();
  },

  icon_url() {
    return faker.image.avatar();
  },

  is_active() {
    return faker.datatype.boolean();
  },

  name() {
    return faker.company.name();
  },

  created_on: faker.date.recent().toString(),

  dev_framework() {
    return faker.helpers.arrayElement(ENUMS.FILE_DEV_FRAMEWORK.BASE_CHOICES);
  },
};

export default Base.extend(FILE_FACTORY_DEF);

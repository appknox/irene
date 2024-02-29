import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';
import { RISK_COLOR_CODE } from 'irene/utils/constants';
import Base from './base';

export const FILE_FACTORY_DEF = {
  uuid: faker.number.int(),
  device_token: faker.number.int(),
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

  dynamic_status() {
    return faker.helpers.arrayElement(ENUMS.DYNAMIC_STATUS.VALUES);
  },

  name() {
    return faker.company.name();
  },

  created_on: faker.date.recent().toString(),

  doughnutData() {
    const countRiskCritical = faker.number.int({
      min: 0,
      max: 10,
    });

    const countRiskHigh = faker.number.int({
      min: 0,
      max: 10,
    });

    const countRiskMedium = faker.number.int({
      min: 0,
      max: 10,
    });

    const countRiskLow = faker.number.int({
      min: 0,
      max: 10,
    });

    const countRiskNone = faker.number.int({
      min: 0,
      max: 10,
    });

    const countRiskUnknown = faker.number.int({
      min: 0,
      max: 10,
    });

    this.countRiskCritical = countRiskCritical;
    this.countRiskHigh = countRiskHigh;
    this.countRiskMedium = countRiskMedium;
    this.countRiskLow = countRiskLow;
    this.countRiskNone = countRiskNone;
    this.countRiskUnknown = countRiskUnknown;

    return {
      labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'PASSED', 'UNKNOWN'],
      datasets: [
        {
          label: 'Risks',
          data: [
            countRiskCritical,
            countRiskHigh,
            countRiskMedium,
            countRiskLow,
            countRiskNone,
            countRiskUnknown,
          ],
          backgroundColor: [
            RISK_COLOR_CODE.CRITICAL,
            RISK_COLOR_CODE.DANGER,
            RISK_COLOR_CODE.WARNING,
            RISK_COLOR_CODE.INFO,
            RISK_COLOR_CODE.SUCCESS,
            RISK_COLOR_CODE.DEFAULT,
          ],
        },
      ],
    };
  },
};

export default Base.extend(FILE_FACTORY_DEF);

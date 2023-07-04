import faker from 'faker';
import ENUMS from 'irene/enums';
import { RISK_COLOR_CODE } from 'irene/utils/constants';
import Base from './base';

export default Base.extend({
  uuid: faker.random.number(),
  device_token: faker.random.number(),
  version: faker.random.number(),
  version_code: faker.random.number(),
  md5hash: faker.random.number(),
  sha1hash: faker.random.number(),
  report: faker.internet.avatar(),
  manual: false,
  api_scan_progress: faker.random.number(),
  static_scan_progress: faker.random.number(),
  is_static_done: faker.random.boolean(),
  is_dynamic_done: faker.random.boolean(),
  is_manual_done: faker.random.boolean(),
  is_api_done: faker.random.boolean(),
  can_generate_report: faker.random.boolean(),

  risk_count_critical: () => faker.datatype.number(20),
  risk_count_high: () => faker.datatype.number(20),
  risk_count_low: () => faker.datatype.number(20),
  risk_count_medium: () => faker.datatype.number(20),
  risk_count_passed: () => faker.datatype.number(20),
  risk_count_unknown: () => faker.datatype.number(20),

  icon_url() {
    return faker.internet.avatar();
  },

  is_active() {
    return faker.random.boolean();
  },

  dynamic_status() {
    return faker.random.arrayElement(ENUMS.DYNAMIC_STATUS.VALUES);
  },

  name() {
    return faker.company.companyName();
  },

  created_on: faker.date.recent().toString(),

  doughnutData() {
    const countRiskCritical = faker.datatype.number({
      min: 0,
      max: 10,
    });

    const countRiskHigh = faker.datatype.number({
      min: 0,
      max: 10,
    });

    const countRiskMedium = faker.datatype.number({
      min: 0,
      max: 10,
    });

    const countRiskLow = faker.datatype.number({
      min: 0,
      max: 10,
    });

    const countRiskNone = faker.datatype.number({
      min: 0,
      max: 10,
    });

    const countRiskUnknown = faker.datatype.number({
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
});

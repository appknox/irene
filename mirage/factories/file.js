/* eslint-disable prettier/prettier */
import faker from 'faker';
import ENUMS from 'irene/enums';
import { RISK_COLOR_CODE } from 'irene/utils/constants';
import Base from './base';

export default Base.extend({
  uuid: faker.random.number(),
  deviceToken: faker.random.number(),
  version: faker.random.number(),
  version_code: faker.random.number(),
  md5hash: faker.random.number(),
  sha1hash: faker.random.number(),
  report: faker.internet.avatar(),
  manual: false,
  apiScanProgress: faker.random.number(),
  staticScanProgress: faker.random.number(),
  isStaticDone: faker.random.boolean(),
  isDynamicDone: faker.random.boolean(),
  isManualDone: faker.random.boolean(),
  isApiDone: faker.random.boolean(),

  iconUrl() {
    return faker.internet.avatar();
  },

  isActive() {
    return faker.random.boolean();
  },

  dynamicStatus() {
    return faker.random.arrayElement(ENUMS.DYNAMIC_STATUS.VALUES);
  },

  name() {
    return faker.company.companyName();
  },

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

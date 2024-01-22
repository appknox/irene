import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  riskCountCritical: faker.number.int({ min: 0, max: 100 }),
  riskCountHigh: faker.number.int({ min: 0, max: 100 }),
  riskCountMedium: faker.number.int({ min: 0, max: 100 }),
  riskCountLow: faker.number.int({ min: 0, max: 100 }),
  riskCountPassed: faker.number.int({ min: 0, max: 100 }),
  riskCountUntested: faker.number.int({ min: 0, max: 100 }),

  totalCount() {
    return (
      this.riskCountCritical +
      this.riskCountHigh +
      this.riskCountMedium +
      this.riskCountLow +
      this.riskCountPassed +
      this.riskCountUntested
    );
  },

  criticalPercent() {
    return (this.riskCountCritical / this.totalCount) * 100;
  },
  highPercent() {
    return (this.riskCountHigh / this.totalCount) * 100;
  },
  mediumPercent() {
    return (this.riskCountMedium / this.totalCount) * 100;
  },
  lowPercent() {
    return (this.riskCountLow / this.totalCount) * 100;
  },
  passedPercent() {
    return (this.riskCountPassed / this.totalCount) * 100;
  },
  untestedPercent() {
    return (this.riskCountUntested / this.totalCount) * 100;
  },
});

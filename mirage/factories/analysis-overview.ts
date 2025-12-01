import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export const ANALYSIS_FACTORY_DEF = {
  overridden_risk: faker.helpers.arrayElement([null, 1, 2, 3, 4]),
  status: faker.helpers.arrayElement(ENUMS.ANALYSIS.VALUES),
  created_on: faker.date.past(),
  updated_on: faker.date.past(),

  risk() {
    return faker.helpers.arrayElement(ENUMS.RISK.VALUES);
  },

  computed_risk() {
    return faker.helpers.arrayElement(ENUMS.RISK.VALUES);
  },
};

export default Factory.extend(ANALYSIS_FACTORY_DEF);

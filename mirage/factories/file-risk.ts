import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

const getRandomInteger = () => faker.number.int({ min: 0, max: 100 });

export const FILE_RISK_FACTORY_DEF = {
  file: (i: number) => i + 100 + 1, // Primary key of the file-risk model
  id: (i: number) => i + 100 + 1,

  rating: getRandomInteger(),
  risk_count_critical: getRandomInteger(),
  risk_count_high: getRandomInteger(),
  risk_count_medium: getRandomInteger(),
  risk_count_low: getRandomInteger(),
  risk_count_passed: getRandomInteger(),
  risk_count_unknown: getRandomInteger(),
  overridden_passed_risk_count: getRandomInteger(),

  risk_count_by_scan_type: () => ({
    api: getRandomInteger(),
    manual: getRandomInteger(),
    static: getRandomInteger(),
    dynamic: getRandomInteger(),
  }),
};

export default Factory.extend(FILE_RISK_FACTORY_DEF);

import { faker } from '@faker-js/faker';
import Base from './base';

export const UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF = {
  id(i: number) {
    return i + 1;
  },

  status() {
    return faker.datatype.boolean();
  },
};

export default Base.extend(UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF);

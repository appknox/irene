import base from './base';
import { faker } from '@faker-js/faker';

export const OWASPMOBILE2024_FACTORY_DEF = {
  title() {
    return faker.lorem.sentence();
  },

  year: faker.date.past().getFullYear(),

  code(i: number) {
    return `owaspmobile2024${i}`;
  },
};

export default base.extend(OWASPMOBILE2024_FACTORY_DEF);

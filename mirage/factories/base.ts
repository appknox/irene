import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export const BASE_FACTORY_DEF = {
  id(i: number) {
    return i + 1;
  },

  created_on: faker.date.past().toISOString(),
  updated_on: faker.date.past().toISOString(),
  // createdBy: an ID of a user
};

export default Factory.extend(BASE_FACTORY_DEF);

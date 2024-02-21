import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export const SBOM_FILE_FACTORY_DEF = {
  id(i: number) {
    return 100 + i + 1;
  },

  file(i: number) {
    return i + 1;
  },

  status: () => faker.number.int({ min: 1, max: 4 }),

  sb_project(i: number) {
    return 1000 + i + 1;
  },

  completed_at: () => faker.date.recent().toString(),
  created_at: () => faker.date.past().toString(),
};

export default Factory.extend(SBOM_FILE_FACTORY_DEF);

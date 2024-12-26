import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  query: () => ({
    q: faker.word.sample(),
  }),

  continuous_discovery: () => faker.datatype.boolean(),
});

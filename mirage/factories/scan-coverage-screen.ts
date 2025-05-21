import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  visited: () => faker.datatype.boolean(),
  identifier: () => faker.string.uuid(),
});

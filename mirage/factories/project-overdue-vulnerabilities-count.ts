import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  count: () => faker.number.int({ min: 2, max: 50 }),
});

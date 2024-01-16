import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  discount: faker.commerce.price(),
  code: faker.person.firstName(),
});

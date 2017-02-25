import { Factory } from 'ember-cli-mirage';
import { faker } from 'ember-cli-mirage';

export default Factory.extend({
  discount: faker.commerce.price,
  code: faker.name.firstName
});

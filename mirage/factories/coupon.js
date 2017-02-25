import { Factory } from 'ember-cli-mirage';
import { faker } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';

export default Factory.extend({
  discount: faker.commerce.price,
  code: faker.name.firstName
});

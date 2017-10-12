import { Factory, faker } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';

export default Factory.extend({
  invoiceId: faker.random.number,
  amount: faker.commerce.price,
  paidOn: faker.date.past
});

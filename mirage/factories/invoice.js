/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  invoiceId: faker.random.number(),
  amount: faker.commerce.price(),
  paidOn: faker.date.past(),
  planName: faker.name.firstName(),
  isPaid: faker.random.boolean()
});

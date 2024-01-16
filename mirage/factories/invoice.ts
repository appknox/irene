import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  invoiceId: faker.number.int(),
  amount: faker.commerce.price(),
  paidOn: faker.date.past(),
  planName: faker.person.firstName(),
  isPaid: faker.datatype.boolean(),
});

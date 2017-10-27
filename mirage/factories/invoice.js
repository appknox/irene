import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  invoiceId: faker.random.number,
  amount: faker.commerce.price,
  paidOn: faker.date.past,
  planName: faker.name.firstName,
  isPaid: faker.random.boolean
});

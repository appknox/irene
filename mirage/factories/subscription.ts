import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  subscriptionId: faker.person.firstName(),
  billingPeriod: faker.number.int(),
  billingPeriodUnit: faker.person.firstName(),
  planQuantity: faker.number.int(),
  expiryDate: faker.date.future(),
  status: faker.person.firstName(),
  isActive: faker.datatype.boolean(),
  isTrial: faker.datatype.boolean(),
  isCancelled: faker.datatype.boolean(),
  isPerScan: false,
  planName: faker.person.firstName(),
});

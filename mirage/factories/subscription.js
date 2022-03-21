/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  subscriptionId: faker.name.firstName(),
  billingPeriod: faker.random.number(),
  billingPeriodUnit: faker.name.firstName(),
  planQuantity: faker.random.number(),
  expiryDate: faker.date.future(),
  status: faker.name.firstName(),
  isActive: faker.random.boolean(),
  isTrial: faker.random.boolean(),
  isCancelled: faker.random.boolean(),
  isPerScan: false,
  planName: faker.name.firstName()

});

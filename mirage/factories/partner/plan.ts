import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

export default Factory.extend({
  scansLeft: faker.number.int(),
  limitedScans: faker.helpers.arrayElement([true, false]),

  projectsLimit: faker.number.int({
    min: 0,
    max: 100,
  }),

  expiryDate() {
    return dayjs(faker.date.future()).toISOString();
  },

  isPaymentExpired() {
    const expiryDate = this.expiryDate as string;

    return dayjs().isAfter(expiryDate);
  },
});

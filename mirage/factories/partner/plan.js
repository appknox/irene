import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import dayjs from 'dayjs';

export default Factory.extend({
  scansLeft: faker.random.number(),
  limitedScans: faker.random.arrayElement([true, false]),
  projectsLimit: faker.random.number({
    min: 0,
    max: 100,
  }),
  expiryDate() {
    return dayjs(faker.date.future()).toISOString();
  },

  isPaymentExpired() {
    return dayjs().isAfter(this.expiryDate);
  },
});

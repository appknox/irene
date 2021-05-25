import dayjs from 'dayjs';
import faker from 'faker';
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  email(i) {
    return `test${i}@example.test`;
  },
  createdOn() {
    return dayjs(faker.date.past()).toISOString();
  },
  updatedOn() {
    return dayjs(faker.date.recent()).toISOString();
  },
  validUntil() {
    return dayjs(faker.date.future()).toISOString();
  },
  source() {
    return faker.random.arrayElement(["registration", "backoffice", "invitation"]);
  },
  isActivated() {
    return false;
  },
  approvalStatus() {
    return faker.random.arrayElement(["pending", "rejected", "approved"]);
  },
  data(i) {
    return {
      company: `Company ${i}`,
      first_name: `FirstName${i}`,
    }
  },
});

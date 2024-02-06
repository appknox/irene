import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  email(i) {
    return `test${i}@example.test`;
  },

  created_on() {
    return dayjs(faker.date.past()).toISOString();
  },

  updated_on() {
    return dayjs(faker.date.recent()).toISOString();
  },

  validUntil() {
    return dayjs(faker.date.future()).toISOString();
  },

  source() {
    return faker.helpers.arrayElement([
      'registration',
      'backoffice',
      'invitation',
    ]);
  },

  is_activated() {
    return false;
  },

  approval_status() {
    return faker.helpers.arrayElement(['pending', 'rejected', 'approved']);
  },

  data(i) {
    return {
      company: `Company ${i}`,
      first_name: `FirstName${i}`,
    };
  },
});

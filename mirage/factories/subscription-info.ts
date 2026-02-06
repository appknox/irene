import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  start_date() {
    return faker.date.past({ years: 1 }).toISOString();
  },

  expiry_date() {
    return faker.date.future({ years: 1 }).toISOString();
  },

  original_licenses() {
    return faker.number.int({ min: 50, max: 100 });
  },

  licenses_remaining() {
    return faker.number.int({ min: 1, max: 10 });
  },
});

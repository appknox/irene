import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  id: (i) => i + 1,
  project: (i) => i + 1,
  service_account: (i) => i + 1,
  added_on: () => faker.date.anytime().toString(),
});

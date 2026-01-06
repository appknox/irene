import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  type: () => faker.helpers.arrayElement(['Manual' as const, 'Auto' as const]),
  created_on: () => faker.date.recent(),
  projects: () => ({}),
});

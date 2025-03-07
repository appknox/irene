import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  project_key: () => faker.lorem.slug(1),
  project_name: () => faker.lorem.slug(1),
  risk_threshold: () => faker.helpers.arrayElement([1, 2, 3, 4]),
});

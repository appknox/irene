import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  risk_threshold: () => faker.helpers.arrayElement([1, 2, 3, 4]),
});

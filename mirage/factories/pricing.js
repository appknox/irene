import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  name: faker.name.firstName,
  description: faker.lorem.sentence,
  price: faker.commerce.price,
  projectsLimit: faker.random.number
});

import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  name: faker.system.fileName,
  description: faker.lorem.sentence,
  price: faker.commerce.price
});

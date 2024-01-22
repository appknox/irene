import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  name: faker.person.firstName(),
  price: faker.commerce.price(),
  projectsLimit: faker.number.int(),

  description() {
    const desc = [];

    for (let i = 0; i < 5; i++) {
      desc.push(faker.lorem.words(2).split(' ').join(' -> '));
    }

    return desc.join(',');
  },
});

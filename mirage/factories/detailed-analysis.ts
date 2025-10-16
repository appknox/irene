import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: faker.string.uuid,
  screenshots: () => {
    const count = faker.number.int({ min: 0, max: 5 });

    return Array(count)
      .fill(null)
      .map(() => faker.image.url({ width: 800, height: 600 }));
  },
});

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,

  findings: () => {
    const desc = [];

    for (let i = 0; i < 3; i++) {
      const hasScreenshot = faker.datatype.boolean();

      desc.push({
        title: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        screenshot: hasScreenshot
          ? faker.image.urlLoremFlickr({ category: 'technology' })
          : '',
      });
    }

    return desc;
  },
});

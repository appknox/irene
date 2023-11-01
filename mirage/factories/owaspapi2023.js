import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  code(i) {
    return `owaspapi2023-${i}`;
  },

  title: faker.lorem.sentence(),
  year: faker.date.past().year,
});

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  createdOn: faker.date.recent(),
  hasRead: faker.datatype.boolean(),
  messageCode: faker.string.sample(10),

  context: function () {
    return {};
  },
});

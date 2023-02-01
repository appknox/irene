import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  createdOn: faker.date.recent(),
  hasRead: faker.datatype.boolean(),
  messageCode: faker.datatype.string(10),
  context: function () {
    return {};
  },
});

import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  name: faker.lorem.word(),
  organization: 1,
  created_on: faker.date.past(),
  members_count: faker.datatype.number(),
  projects_count: faker.datatype.number(),

  members() {
    return `https://api.appknox.com/api/organizations/${this.organization}/teams/${this.id}/members`;
  },
});

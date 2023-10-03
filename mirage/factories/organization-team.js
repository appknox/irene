import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  name() {
    return faker.lorem.word();
  },

  organization: 1,

  created_on() {
    return faker.date.past();
  },

  members_count() {
    return faker.datatype.number();
  },

  projects_count() {
    return faker.datatype.number();
  },

  members() {
    return `https://api.appknox.com/api/organizations/${this.organization}/teams/${this.id}/members`;
  },
});

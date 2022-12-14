import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

const roleDisplayMap = {
  0: 'Member',
  1: 'Owner',
  2: 'Admin',
};

export default Factory.extend({
  created_on: faker.date.past(),
  is_active: true,
  is_admin() {
    return this.role === 1 || this.role === 2;
  },
  member(i) {
    return i + 1;
  },
  role: 1,
  role_display() {
    return roleDisplayMap[this.role];
  },
});

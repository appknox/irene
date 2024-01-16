import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const roleDisplayMap = {
  0: 'Member',
  1: 'Owner',
  2: 'Admin',
};

export default Factory.extend({
  created_on: faker.date.past(),
  is_active: true,

  is_admin() {
    const role = this.role as number;

    return role === 1 || role === 2;
  },

  member(i) {
    return i + 1;
  },

  role: 1,

  role_display() {
    const role = this.role as keyof typeof roleDisplayMap;

    return roleDisplayMap[role];
  },

  last_logged_in: faker.date.past(),
});

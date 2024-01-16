import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  name: faker.company.name(),
  userCount: faker.number.int(),
  teamCount: faker.number.int(),
  invitationCount: faker.number.int(),
  projects_count: faker.number.int(),
});

import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  jiraProject: faker.company.name,
});

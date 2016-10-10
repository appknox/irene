import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  name: faker.company.companyName,
  packageName:  faker.internet.domainName,
  platform: faker.random.arrayElement([0, 1]),
  source: faker.random.arrayElement([0, 1, 2]),
  version : faker.random.number,
  fileCount: faker.random.number,
  githubRepo: faker.random.firstName,
  jiraProject: faker.random.firstName,
  testUser: faker.random.firstName,
  testPassword: faker.internet.password
});

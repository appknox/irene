import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  // owner: DS.belongsTo 'user', inverse: 'ownedProjects'
  name: faker.company.companyName,
  packageName:  faker.internet.domainName,
  platform: faker.random.arrayElement([0, 1]),
  source: faker.random.arrayElement([0, 1, 2]),
  version : faker.random.number,
  // files: DS.hasMany 'file', inverse :'project'
  // collaboration: DS.hasMany 'collaboration', inverse: 'project'
  fileCount: faker.random.number,
  githubRepo: faker.random.firstName,
  jiraProject: faker.random.firstName,
  testUser: faker.random.firstName,
  testPassword: faker.internet.password,
  lastFile (i) {
    return i + 1;
  }
});

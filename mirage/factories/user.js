import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  id (i) {
    return i;
  },
  username: faker.name.firstName,
  email: faker.internet.email,
  emailmd5: faker.internet.avatar,
  firstName: faker.name.firstName,
  lastName: faker.name.lastName,
  // ownedProjects: DS.hasMany 'project', inverse:'owner'
  // submissions: DS.hasMany 'submission', inverse:'user'
  namespaces: faker.internet.domainName,
  // collaboration: DS.hasMany 'collaboration', inverse:'user'
  expiryDate: faker.date.future,
  hasGithubToken: faker.random.boolean,
  hasJiraToken: faker.random.boolean,
  // socketId: faker.random.uuid,
  limitedScans: faker.random.number,
  scansLeft: faker.random.number
});

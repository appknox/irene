import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  id (i) {
    return i+1;
  },

  username: faker.name.firstName,
  email: faker.internet.email,
  emailmd5:  faker.name.firstName,
  firstName: faker.name.firstName,
  lastName: faker.name.lastName,
  namespaces: faker.internet.domainName,
  expiryDate: faker.date.future,
  hasGithubToken: faker.random.boolean,
  hasJiraToken: faker.random.boolean,
  limitedScans: faker.random.number,
  scansLeft: faker.random.number
});

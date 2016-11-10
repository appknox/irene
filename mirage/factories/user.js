import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  id (i) {
    return i+1;
  },

  username: faker.name.firstName,
  email: faker.internet.email,
  firstName: faker.name.firstName,
  lastName: faker.name.lastName,
  namespaces: faker.internet.domainName,
  expiryDate: faker.date.future,
  hasGithubToken: faker.random.boolean,
  hasJiraToken: faker.random.boolean,
  limitedScans: faker.random.boolean,
  scansLeft: faker.random.number,
  uuid: faker.random.number,
  socketId: faker.random.number,

  lang(){
    return faker.random.arrayElement(["en"]);
  },

});

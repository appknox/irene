/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  id (i) {
    return i+1;
  },

  username: faker.name.firstName(),
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  expiryDate: faker.date.future(),

  hasGithubToken: faker.random.boolean(),
  hasJiraToken: faker.random.boolean(),
  limitedScans: false,
  scansLeft: faker.random.number(),
  uuid: faker.random.number(),
  socketId: faker.random.number(),
  mfaMethod(){
    return faker.random.arrayElement(ENUMS.MFA_METHOD.VALUES);
  },

  projectCount() {
    return faker.random.arrayElement([1,2,3,4]);
  },

  lang(){
    return faker.random.arrayElement(["en"]);
  },

  namespaces(){
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.internet.domainName(2).split(" "));
    }
    return desc.join(",");
  }

});

import { faker } from 'ember-cli-mirage';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({

  name: faker.company.companyName,
  packageName:  faker.internet.domainName,
  version : faker.random.number,
  githubRepo: faker.random.firstName,
  jiraProject: faker.random.firstName,
  testUser: faker.random.firstName,
  testPassword: faker.internet.password,
  url: faker.internet.domainName,

  platform(){
    return faker.random.arrayElement(ENUMS.PLATFORM.VALUES);
  }

});

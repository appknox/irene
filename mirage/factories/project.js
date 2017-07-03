import { faker } from 'ember-cli-mirage';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({

  name: faker.company.companyName,
  packageName:  faker.internet.domainName,
  version : faker.random.number,
  githubRepo: faker.company.companyName,
  jiraProject: faker.company.companyName,
  testUser: faker.random.firstName,
  testPassword: faker.internet.password,
  url: faker.internet.domainName,
  platformVersion: faker.random.number,
  fileCount: 2,

  platform(){
    return faker.random.arrayElement(ENUMS.PLATFORM.VALUES);
  },

  deviceType() {
    return faker.random.arrayElement(ENUMS.DEVICE_TYPE.VALUES);
  },

  apiUrlFilters(){
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.internet.domainName(2).split(" ").join(" -> "));
    }
    return desc.join(",");
  }
});

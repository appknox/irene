/* eslint-disable prettier/prettier */
import faker from 'faker';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({

  name: faker.company.companyName(),
  packageName:  faker.internet.domainName(),
  version : faker.random.number(),
  githubRepo: faker.company.companyName(),
  jiraProject: faker.company.companyName(),
  testUser: faker.name.firstName(),
  testPassword: faker.internet.password(),
  url: faker.internet.domainName(),
  platformVersion: faker.random.number(),
  fileCount: 2,
  showUnknownAnalysis: faker.random.boolean(),
  showIgnoredAnalysis: faker.random.boolean(),
  activeProfileId: 2,

  platform: 1,

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

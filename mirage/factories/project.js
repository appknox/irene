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
    for (var i = 0; i < 3; i++) {
      desc.push({
        extra_description: faker.lorem.sentence(),
        description: "/var/mobile/Containers/Data/Application/A6564F42-72F2-4ADF-BCC3-A93BD0BC0D76/Library/Application Support/FlurryFiles/67490C75-A034-4435-A3F0-71D2BB637D81" //faker.lorem.sentence()
      });
    }
    return desc;
  }
});

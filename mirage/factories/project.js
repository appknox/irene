/* eslint-disable prettier/prettier */
import faker from 'faker';
import ENUMS from 'irene/enums';
import Base from './base';

export default Base.extend({
  name: faker.company.companyName(),
  packageName: faker.internet.domainName(),
  version: faker.random.number(),
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

  platform() {
    return faker.random.arrayElement(ENUMS.PLATFORM.VALUES);
  },

  deviceType() {
    return faker.random.arrayElement(ENUMS.DEVICE_TYPE.VALUES);
  },

  platformIconClass() {
    switch (this.platform) {
      case ENUMS.PLATFORM.ANDROID:
        return 'android';
      case ENUMS.PLATFORM.IOS:
        return 'apple';
      case ENUMS.PLATFORM.WINDOWS:
        return 'windows';
      default:
        return 'mobile';
    }
  },

  apiUrlFilters() {
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.internet.domainName(2).split(' ').join(' -> '));
    }
    return desc.join(',');
  },
});

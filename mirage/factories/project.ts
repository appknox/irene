import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';
import Base from './base';

export const PROJECT_FACTORY_DEF = {
  id(i: number) {
    return i + 1;
  },

  version: faker.number.int(),
  github_repo: faker.company.name(),
  jira_project: faker.company.name(),
  test_user: faker.person.firstName(),
  platform_version: faker.number.int(),
  file_count: 2,
  show_unknown_analysis: faker.datatype.boolean(),
  show_ignored_analysis: faker.datatype.boolean(),
  is_manual_scan_available: faker.datatype.boolean(),

  name() {
    return faker.company.name();
  },

  active_profile_id(i: number) {
    return i + 1;
  },

  get platform() {
    return faker.helpers.arrayElement([0, 1]);
  },

  test_password() {
    return faker.internet.password();
  },

  url() {
    return faker.internet.domainName();
  },

  package_name() {
    return faker.internet.domainName();
  },

  device_type() {
    return faker.helpers.arrayElement(ENUMS.DS_DEVICE_TYPE.VALUES);
  },

  platformIconClass() {
    const platform = this.platform;

    switch (platform) {
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
};

export default Base.extend(PROJECT_FACTORY_DEF);

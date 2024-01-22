import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';
import Base from './base';

export default Base.extend({
  created_on() {
    return faker.date.past();
  },

  app_name() {
    return faker.company.name();
  },

  version() {
    return faker.number.int();
  },

  version_code() {
    return faker.number.int();
  },

  comparable_version() {
    const platform = this.am_app?.project?.platform;

    if (platform === ENUMS.PLATFORM.IOS) {
      return this.version;
    }

    return this.version_code;
  },

  display_version() {
    return this.comparable_version;
  },
});

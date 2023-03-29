import faker from 'faker';
import ENUMS from 'irene/enums';
import Base from './base';

export default Base.extend({
  created_on() {
    return faker.date.past();
  },

  app_name() {
    return faker.company.companyName();
  },

  version() {
    return faker.random.number();
  },

  version_code() {
    return faker.random.number();
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

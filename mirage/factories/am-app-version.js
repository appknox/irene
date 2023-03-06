import faker from 'faker';
import ENUMS from 'irene/enums';
import Base from './base';

export default Base.extend({
  created_on: faker.date.past(),
  version: faker.random.number(),
  version_code: faker.random.number(),

  comparable_version() {
    const platform = this.am_app?.project?.platform;
    if (platform === ENUMS.PLATFORM.IOS) {
      return this.version;
    }
    return this.version_code;
  },
});

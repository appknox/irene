import faker from 'faker';
import ENUMS from 'irene/enums';
import Base from './base';

export default Base.extend({
  createdOn: faker.date.past(),
  version: faker.random.number(),
  versionCode: faker.random.number(),

  comparableVersion() {
    const platform = this.amApp?.project?.platform;
    if (platform === ENUMS.PLATFORM.IOS) {
      return this.version;
    }
    return this.versionCode;
  },
});

import faker from 'faker';
import ENUMS from 'irene/enums';
import Base from '../base';

export default Base.extend({
  automated_upload: faker.random.boolean(),
  monitoring_enabled: faker.random.boolean(),
  ulid: faker.random.word(),

  platform() {
    switch (faker.random.arrayElement([0, 1, 2])) {
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
});

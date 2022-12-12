import { Factory } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';
import faker from 'faker';

export default Factory.extend({
  id(i) {
    return 100 + i;
  },

  value: faker.internet.domainName,
  requested_by() {
    return faker.datatype.number();
  },
  approved_by() {
    return this.is_approved ? faker.datatype.number() : null;
  },
  is_approved: faker.datatype.boolean(),
  platform: faker.random.arrayElement([0, 1]),
  platform_display() {
    switch (this.platform) {
      case ENUMS.PLATFORM.ANDROID:
        return 'Android';
      case ENUMS.PLATFORM.IOS:
        return 'iOS';
      default:
        return 'mobile';
    }
  },
  created_on: faker.date.past(),
  approved_on() {
    return this.is_approved ? faker.date.recent() : null;
  },
  organization: 1,
});

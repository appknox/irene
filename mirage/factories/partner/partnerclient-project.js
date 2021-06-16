import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import dayjs from 'dayjs';

export default Factory.extend({
  packageName: 'com.appknox.mfva',
  platform: faker.random.arrayElement(['iOS', 'Android']),
  createdOn() {
    return new dayjs(faker.date.past()).toISOString();
  },

  platformIcon() {
    return this.platform === 'iOS' ? 'apple' : 'android';
  },
});

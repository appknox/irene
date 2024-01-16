import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

export default Factory.extend({
  packageName: 'com.appknox.mfva',
  platform: faker.helpers.arrayElement(['iOS', 'Android']),

  createdOn() {
    return dayjs(faker.date.past()).toISOString();
  },

  platformIcon() {
    const platform = this.platform as string;

    return platform === 'iOS' ? 'apple' : 'android';
  },
});

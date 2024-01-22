import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { htmlSafe } from '@ember/template';

export default Factory.extend({
  name: faker.company.name(),
  iconUrl: faker.image.url(),

  createdOn() {
    return dayjs(faker.date.past()).toISOString();
  },

  version() {
    return `${faker.number.float({ min: 0, max: 10, precision: 0.01 })}`;
  },

  versionCode: faker.number.int({ min: 0, max: 10 }),

  backgroundIconStyle() {
    const url = this.iconUrl as string;

    return htmlSafe(`background-image: url(${url})`);
  },
});

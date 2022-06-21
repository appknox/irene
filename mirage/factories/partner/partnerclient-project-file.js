import { Factory } from 'ember-cli-mirage';
import dayjs from 'dayjs';
import faker from 'faker';
import { htmlSafe } from '@ember/template';

export default Factory.extend({
  name: faker.company.companyName(),
  iconUrl: faker.image.imageUrl(),
  createdOn() {
    return new dayjs(faker.date.past()).toISOString();
  },
  version() {
    return `${faker.random.number({ min: 0, max: 10, precision: 0.01 })}`;
  },
  versionCode: faker.random.number({ min: 0, max: 10 }),
  backgroundIconStyle() {
    return htmlSafe(`background-image: url(${this.iconUrl})`);
  },
});

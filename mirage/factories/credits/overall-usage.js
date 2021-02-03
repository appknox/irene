import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  date() {
    return faker.date.between('2021-01-01', '2021-02-28');
  },
  upload() {
    return Math.floor(Math.random() * 100) + 1;
  }
});

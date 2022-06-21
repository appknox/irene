import { Factory } from 'ember-cli-mirage';
import dayjs from 'dayjs';
import faker from 'faker';

export default Factory.extend({
  language: faker.random.arrayElement(['en', 'ja']),
  progress: faker.datatype.number({ min: 0, max: 100 }),
  generatedOn() {
    return new dayjs(faker.date.past()).toISOString();
  },
  file: 1,
  isGenerating() {
    return this.progress < 100;
  },
});

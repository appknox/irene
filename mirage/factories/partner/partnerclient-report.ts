import { Factory } from 'miragejs';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  language: faker.helpers.arrayElement(['en', 'ja']),
  progress: faker.number.int({ min: 0, max: 100 }),

  generatedOn() {
    return dayjs(faker.date.past()).toISOString();
  },

  file: 1,

  isGenerating() {
    const progress = this.progress as number;

    return progress < 100;
  },
});

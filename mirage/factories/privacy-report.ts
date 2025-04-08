import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 1,
  language: 'en',
  pdf_progress: 0,
  generated_on: faker.date.recent().toString(),
  pdf_status: faker.number.int({ min: 1, max: 4 }),
  report_password: faker.string.alphanumeric(12).toUpperCase(),
  privacy_analysis_status: faker.number.int({ min: 1, max: 3 }),
});

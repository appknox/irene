import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 1,
  language: () => faker.helpers.arrayElement(['en', 'ja']),
  pdf_progress: () => faker.number.int({ min: 0, max: 100 }),
  generated_on: () => faker.date.recent().toString(),
  pdf_status: () => faker.number.int({ min: 1, max: 5 }),
  report_password: () => faker.string.alphanumeric(12).toUpperCase(),
  refresh_available: () => faker.datatype.boolean(),
});

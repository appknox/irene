import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  id: (i) => i + 1,
  sb_file: (i) => 100 + i + 1,
  language: 'en',
  pdf_progress: 0,
  generated_on: faker.date.recent().toString(),
  pdf_status: faker.datatype.number({ min: 1, max: 4 }),
  report_password: faker.random.alphaNumeric(12).toUpperCase(),
});

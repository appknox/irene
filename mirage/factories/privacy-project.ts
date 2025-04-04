import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 1,
  file: (i) => 100 + i + 1,
  project: (i) => i + 1,
  latest_file_privacy_analysis_status: faker.number.int({ min: 0, max: 3 }),
  last_scanned_on: faker.date.recent().toString(),
});

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 1,
  latest_file_privacy_analysis_status: faker.number.int({ min: 0, max: 2 }),
  last_scanned_on: faker.date.recent().toString(),
  highlight: faker.datatype.boolean(),
});

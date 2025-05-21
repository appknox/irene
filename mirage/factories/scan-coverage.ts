import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  status_label: () => faker.lorem.word(),
  total_num_of_visited_screens: () => faker.number.int({ min: 0, max: 10 }),
  total_num_of_screens: () => faker.number.int({ min: 10, max: 20 }),
  error_message: () => faker.lorem.sentence(),
  error_code: () => faker.lorem.word(),
  is_any_screen_coverage_complete: () => faker.datatype.boolean(),
  coverage: () => faker.number.int({ min: 0, max: 100 }),

  status: () =>
    faker.helpers.arrayElement(ENUMS.SCAN_COVERAGE_STATUS.BASE_CHOICES),
});

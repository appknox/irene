import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  version: faker.number.int(),
  isTablet: faker.datatype.boolean(),

  platform() {
    return faker.helpers.arrayElement(ENUMS.PLATFORM.VALUES);
  },
});

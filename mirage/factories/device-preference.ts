import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  device_type: faker.helpers.arrayElement(ENUMS.DEVICE_TYPE.BASE_VALUES),
  platform_version: () => faker.system.semver(),
});

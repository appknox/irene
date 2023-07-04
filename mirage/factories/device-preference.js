import { Factory } from 'ember-cli-mirage';

import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  device_type: faker.random.arrayElement(ENUMS.DEVICE_TYPE.BASE_VALUES),
  platform_version: () => faker.system.semver(),
});

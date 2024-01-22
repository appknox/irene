import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  is_tablet: () => faker.datatype.boolean(),
  platform_version: () => faker.system.semver(),
  platform: () => faker.helpers.arrayElement([0, 1]),
});

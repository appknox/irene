import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  is_tablet: () => faker.random.boolean(),
  platform_version: () => faker.system.semver(),
  platform: () => faker.random.arrayElement([0, 1]),
});

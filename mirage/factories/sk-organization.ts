import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  add_appknox_project_to_inventory_by_default: faker.datatype.boolean(),
  auto_discovery_enabled: faker.datatype.boolean(),
  autodiscovery_onboarding_done: faker.datatype.boolean(),
});

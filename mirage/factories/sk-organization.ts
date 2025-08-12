import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  updated_on: () => faker.date.recent().toISOString(),
  created_on: () => faker.date.recent().toISOString(),

  add_appknox_project_to_inventory_by_default: faker.datatype.boolean(),
  auto_discovery_enabled: faker.datatype.boolean(),
  autodiscovery_onboarding_done: faker.datatype.boolean(),

  sk_features: () => ({
    inventory: () => faker.datatype.boolean(),
    drift_detection: () => faker.datatype.boolean(),
    fake_app_detection: () => faker.datatype.boolean(),
  }),
});

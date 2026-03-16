import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  title: () => faker.company.name(),
  package_name: () => faker.internet.domainName(),
  app_url: () => faker.internet.url(),
  dev_name: () => faker.person.fullName(),
  original_app_icon_url: () => faker.image.imageUrl(),
  fake_app_icon_url: () => faker.image.imageUrl(),
  ai_confidence: () => faker.number.float({ min: 0, max: 1, precision: 0.01 }),
  ai_classification_justification: () => faker.lorem.sentence(),
  ai_classification_label: () =>
    faker.helpers.arrayElement(['brand_abuse', 'fake_app']),

  ai_scores: () => ({
    SemanticSimilarityRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),
    PackageSimilarityRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),
    LogoSimilarityRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),
    DeveloperConsistencyRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),
  }),

  store: () => ({
    id: faker.number.int(),
    name: 'Google Play',
    identifier: 'com.android.vending',
    icon: faker.image.imageUrl(),
    platform: ENUMS.PLATFORM.ANDROID,
    platform_display: 'android',
  }),

  status: () => 0,
  reviewed_by: () => null,
  is_ignored: () => false,
  is_added_to_inventory: () => false,
  created_on: () => faker.date.past().toISOString(),
});

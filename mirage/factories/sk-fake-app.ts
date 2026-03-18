import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

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
    final: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),

    SemanticSimilarityRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),

    SemanticSimilarityRule_justification: faker.lorem.sentence(),

    LogoSimilarityRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),

    LogoSimilarityRule_justification: faker.lorem.sentence(),

    TitleBrandAbuseRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),

    TitleBrandAbuseRule_justification: faker.lorem.sentence(),

    PackageSimilarityRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),

    PackageSimilarityRule_justification: faker.lorem.sentence(),

    DeveloperConsistencyRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),

    DeveloperConsistencyRule_justification: faker.lorem.sentence(),

    AppFunctionalitySimilarityRule: faker.number.float({
      min: 0,
      max: 1,
      precision: 0.01,
    }),

    AppFunctionalitySimilarityRule_justification: faker.lorem.sentence(),
  }),

  ai_score_levels: () => ({
    LogoSimilarityRule: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
    TitleBrandAbuseRule: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
    PackageSimilarityRule: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
    SemanticSimilarityRule: faker.helpers.arrayElement([
      'LOW',
      'MEDIUM',
      'HIGH',
    ]),
    DeveloperConsistencyRule: faker.helpers.arrayElement([
      'LOW',
      'MEDIUM',
      'HIGH',
    ]),
    AppFunctionalitySimilarityRule: faker.helpers.arrayElement([
      'LOW',
      'MEDIUM',
      'HIGH',
    ]),
  }),

  sk_store: () => ({
    id: faker.number.int(),
    name: faker.company.name(),
    identifier: faker.internet.domainName(),
    icon: faker.image.url(),
    platform: faker.number.int({ min: 0, max: 1 }),
    platformDisplay: faker.helpers.arrayElement(['android', 'apple']),
  }),

  status: () => 0,
  reviewed_by: () => faker.internet.email(),
  reviewed_on: () => faker.date.past().toISOString(),
  ignore_reason: () => faker.lorem.sentence(),
  is_ignored: () => false,
  is_added_to_inventory: () => false,
  created_on: () => faker.date.past().toISOString(),
});

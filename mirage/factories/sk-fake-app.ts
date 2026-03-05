import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const AI_SCORE_THRESHOLD = ['LOW', 'MEDIUM', 'HIGH'] as const;
const getAIScoreLevels = () => faker.helpers.arrayElement(AI_SCORE_THRESHOLD);

const getAIScore = () =>
  faker.number.float({ min: 0, max: 1, precision: 0.01 });

export default Factory.extend({
  title: () => faker.company.name(),
  package_name: () => faker.internet.domainName(),
  app_url: () => faker.internet.url(),
  dev_name: () => faker.person.fullName(),
  original_app_icon_url: () => faker.image.url(),
  fake_app_icon_url: () => faker.image.url(),
  ai_confidence: () => faker.number.float({ min: 0, max: 1, precision: 0.01 }),
  ai_classification_justification: () => faker.lorem.sentence(),

  ai_classification_label: () =>
    faker.helpers.arrayElement(['brand_abuse', 'fake_app']),

  ai_scores: () => ({
    final: getAIScore,
    SemanticSimilarityRule: getAIScore,
    LogoSimilarityRule: getAIScore,
    AppFunctionalitySimilarityRule: getAIScore,
    TitleBrandAbuseRule: getAIScore,
    PackageSimilarityRule: getAIScore,
    DeveloperConsistencyRule: getAIScore,
    SemanticSimilarityRule_justification: faker.lorem.sentence(),
    LogoSimilarityRule_justification: faker.lorem.sentence(),
    TitleBrandAbuseRule_justification: faker.lorem.sentence(),
    PackageSimilarityRule_justification: faker.lorem.sentence(),
    DeveloperConsistencyRule_justification: faker.lorem.sentence(),
    AppFunctionalitySimilarityRule_justification: faker.lorem.sentence(),
  }),

  ai_score_levels: () => ({
    LogoSimilarityRule: getAIScoreLevels,
    TitleBrandAbuseRule: getAIScoreLevels,
    PackageSimilarityRule: getAIScoreLevels,
    SemanticSimilarityRule: getAIScoreLevels,
    DeveloperConsistencyRule: getAIScoreLevels,
    AppFunctionalitySimilarityRule: getAIScoreLevels,
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

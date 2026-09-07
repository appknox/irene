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
  semantic_analysis_score: () =>
    faker.number.float({ min: 0, max: 100, precision: 0.01 }),

  binary_similarity_score: () =>
    faker.number.float({ min: 0, max: 100, precision: 0.01 }),

  binary_risk_score: () =>
    faker.number.float({ min: 0, max: 100, precision: 0.01 }),

  ai_classification_justification: () => faker.lorem.sentence(),

  ai_classification_label: () =>
    faker.helpers.arrayElement(['brand_abuse', 'fake_app']),

  ai_scores: () => ({
    final: getAIScore(),
    NativeLibsRule: getAIScore(),
    ObfuscationRule: getAIScore(),
    SigningCertRule: getAIScore(),
    EmbeddedFilesRule: getAIScore(),
    ManifestFlagsRule: getAIScore(),
    CertAttributesRule: getAIScore(),
    DynamicLoadingRule: getAIScore(),
    ImplicitIntentsRule: getAIScore(),
    PackerDetectionRule: getAIScore(),
    PermissionDeltaRule: getAIScore(),
    PhishingDomainsRule: getAIScore(),
    TitleBrandAbuseRule: getAIScore(),
    NetworkEndpointsRule: getAIScore(),
    PackageSimilarityRule: getAIScore(),
    SemanticSimilarityRule: getAIScore(),
    SpecialPermissionsRule: getAIScore(),
    SuspiciousApiChainsRule: getAIScore(),
    DeveloperConsistencyRule: getAIScore(),
    LogoSimilarityRule: getAIScore(),
    AppFunctionalitySimilarityRule: getAIScore(),
    NativeLibsRule_justification: faker.lorem.sentence(),
    ObfuscationRule_justification: faker.lorem.sentence(),
    SigningCertRule_justification: faker.lorem.sentence(),
    EmbeddedFilesRule_justification: faker.lorem.sentence(),
    ManifestFlagsRule_justification: faker.lorem.sentence(),
    CertAttributesRule_justification: faker.lorem.sentence(),
    DynamicLoadingRule_justification: faker.lorem.sentence(),
    ImplicitIntentsRule_justification: faker.lorem.sentence(),
    PackerDetectionRule_justification: faker.lorem.sentence(),
    PermissionDeltaRule_justification: faker.lorem.sentence(),
    PhishingDomainsRule_justification: faker.lorem.sentence(),
    TitleBrandAbuseRule_justification: faker.lorem.sentence(),
    NetworkEndpointsRule_justification: faker.lorem.sentence(),
    PackageSimilarityRule_justification: faker.lorem.sentence(),
    SemanticSimilarityRule_justification: faker.lorem.sentence(),
    SpecialPermissionsRule_justification: faker.lorem.sentence(),
    SuspiciousApiChainsRule_justification: faker.lorem.sentence(),
    DeveloperConsistencyRule_justification: faker.lorem.sentence(),
    LogoSimilarityRule_justification: faker.lorem.sentence(),
    AppFunctionalitySimilarityRule_justification: faker.lorem.sentence(),
  }),

  ai_score_levels: () => ({
    NativeLibsRule: getAIScoreLevels(),
    ObfuscationRule: getAIScoreLevels(),
    SigningCertRule: getAIScoreLevels(),
    EmbeddedFilesRule: getAIScoreLevels(),
    ManifestFlagsRule: getAIScoreLevels(),
    CertAttributesRule: getAIScoreLevels(),
    DynamicLoadingRule: getAIScoreLevels(),
    ImplicitIntentsRule: getAIScoreLevels(),
    PackerDetectionRule: getAIScoreLevels(),
    PermissionDeltaRule: getAIScoreLevels(),
    PhishingDomainsRule: getAIScoreLevels(),
    TitleBrandAbuseRule: getAIScoreLevels(),
    NetworkEndpointsRule: getAIScoreLevels(),
    PackageSimilarityRule: getAIScoreLevels(),
    SemanticSimilarityRule: getAIScoreLevels(),
    SpecialPermissionsRule: getAIScoreLevels(),
    SuspiciousApiChainsRule: getAIScoreLevels(),
    DeveloperConsistencyRule: getAIScoreLevels(),
    LogoSimilarityRule: getAIScoreLevels(),
    AppFunctionalitySimilarityRule: getAIScoreLevels(),
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

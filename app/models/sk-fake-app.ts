import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';

import ENUMS from 'irene/enums';
import SkInventoryAppModel from './sk-inventory-app';

export interface SkFakeAppStoreData {
  id: number;
  name: string;
  identifier: 'playstore' | 'appstore' | 'apkmody' | 'aptoide';
  icon: string;
  platform: number;
  platformDisplay: string;
}

export interface SkFakeAppAiScores {
  final: number;
  NativeLibsRule?: number;
  ObfuscationRule?: number;
  SigningCertRule?: number;
  EmbeddedFilesRule?: number;
  ManifestFlagsRule?: number;
  CertAttributesRule?: number;
  DynamicLoadingRule?: number;
  ImplicitIntentsRule?: number;
  PackerDetectionRule?: number;
  PermissionDeltaRule?: number;
  PhishingDomainsRule?: number;
  TitleBrandAbuseRule?: number;
  NetworkEndpointsRule?: number;
  PackageSimilarityRule?: number;
  SemanticSimilarityRule?: number;
  SpecialPermissionsRule?: number;
  SuspiciousApiChainsRule?: number;
  DeveloperConsistencyRule?: number;
  LogoSimilarityRule?: number;
  AppFunctionalitySimilarityRule?: number;
  NativeLibsRule_justification?: string;
  ObfuscationRule_justification?: string;
  SigningCertRule_justification?: string;
  EmbeddedFilesRule_justification?: string;
  ManifestFlagsRule_justification?: string;
  CertAttributesRule_justification?: string;
  DynamicLoadingRule_justification?: string;
  ImplicitIntentsRule_justification?: string;
  PackerDetectionRule_justification?: string;
  PermissionDeltaRule_justification?: string;
  PhishingDomainsRule_justification?: string;
  TitleBrandAbuseRule_justification?: string;
  NetworkEndpointsRule_justification?: string;
  PackageSimilarityRule_justification?: string;
  SemanticSimilarityRule_justification?: string;
  SpecialPermissionsRule_justification?: string;
  SuspiciousApiChainsRule_justification?: string;
  DeveloperConsistencyRule_justification?: string;
  LogoSimilarityRule_justification?: string;
  AppFunctionalitySimilarityRule_justification?: string;
}

export type SkFakeAppAiScoreLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SkFakeAppAiScoreLevels {
  NativeLibsRule?: SkFakeAppAiScoreLevel;
  ObfuscationRule?: SkFakeAppAiScoreLevel;
  SigningCertRule?: SkFakeAppAiScoreLevel;
  EmbeddedFilesRule?: SkFakeAppAiScoreLevel;
  ManifestFlagsRule?: SkFakeAppAiScoreLevel;
  CertAttributesRule?: SkFakeAppAiScoreLevel;
  DynamicLoadingRule?: SkFakeAppAiScoreLevel;
  ImplicitIntentsRule?: SkFakeAppAiScoreLevel;
  PackerDetectionRule?: SkFakeAppAiScoreLevel;
  PermissionDeltaRule?: SkFakeAppAiScoreLevel;
  PhishingDomainsRule?: SkFakeAppAiScoreLevel;
  TitleBrandAbuseRule?: SkFakeAppAiScoreLevel;
  NetworkEndpointsRule?: SkFakeAppAiScoreLevel;
  PackageSimilarityRule?: SkFakeAppAiScoreLevel;
  SemanticSimilarityRule?: SkFakeAppAiScoreLevel;
  SpecialPermissionsRule?: SkFakeAppAiScoreLevel;
  SuspiciousApiChainsRule?: SkFakeAppAiScoreLevel;
  DeveloperConsistencyRule?: SkFakeAppAiScoreLevel;
  LogoSimilarityRule?: SkFakeAppAiScoreLevel;
  AppFunctionalitySimilarityRule?: SkFakeAppAiScoreLevel;
}

export interface SkFakeAppSimilarityScores {
  final: number;
  LogoSimilarityRule?: number;
  TitleBrandAbuseRule?: number;
  PackageSimilarityRule?: number;
  SemanticSimilarityRule?: number;
  DeveloperConsistencyRule?: number;
}

export interface SkFakeAppSignals {
  fakeApp: number;
  sameOrg: number;
  irrelevant: number;
  brandAbuse: number;
  sameCategory: number;
}

export interface SkFakeAppClassificationProbabilities {
  fakeApp: number;
  sameOrg: number;
  irrelevant: number;
  brandAbuse: number;
  sameCategory: number;
}

export interface SkFakeAppClassification {
  label: string;
  confidence: number;
  labelValue: number;
  probabilities: SkFakeAppClassificationProbabilities;
  aiClassificationJustification?: string;
}

export type SkFakeAppClassificationLabel = 'fake_app' | 'brand_abuse';

export default class SkFakeAppModel extends Model {
  @belongsTo('sk-inventory-app', { async: true, inverse: null })
  declare skApp: AsyncBelongsTo<SkInventoryAppModel>;

  @attr('string')
  declare hooperDetectionUlid: string;

  @attr('number')
  declare status: number;

  @attr('string')
  declare statusDisplay: string;

  @attr('string')
  declare packageName: string;

  @attr('string')
  declare title: string;

  @attr('string')
  declare appUrl: string;

  // Renamed to sk-store to avoid conflict with store service in serializer
  @attr()
  declare skStore: SkFakeAppStoreData;

  @attr('string')
  declare devName: string;

  @attr('string')
  declare originalAppIconUrl: string;

  @attr('string')
  declare fakeAppIconUrl: string;

  @attr('number')
  declare confidenceScore: number;

  @attr()
  declare aiScores: SkFakeAppAiScores;

  @attr()
  declare aiScoreLevels: SkFakeAppAiScoreLevels;

  @attr()
  declare similarityScores: SkFakeAppSimilarityScores;

  @attr()
  declare signals: SkFakeAppSignals;

  @attr('number')
  declare aiConfidence: number;

  @attr('number')
  declare semanticAnalysisScore: number;

  @attr('number')
  declare binarySimilarityScore: number;

  @attr('number')
  declare binaryRiskScore: number;

  @attr('string')
  declare aiClassificationLabel: SkFakeAppClassificationLabel;

  @attr()
  declare aiClassification: SkFakeAppClassification;

  @attr('string')
  declare aiClassificationJustification: string;

  @attr('boolean')
  declare hasClassificationMismatch: boolean;

  @attr()
  declare ruleBreakdown: Record<string, unknown>;

  @attr('string')
  declare reviewedBy: string | null;

  @attr('date')
  declare reviewedOn: Date | null;

  @attr('string')
  declare ignoreReason: string | null;

  @belongsTo('sk-inventory-app', { async: true, inverse: null })
  declare addedToInventoryApp: AsyncBelongsTo<SkInventoryAppModel> | null;

  @attr('date')
  declare createdOn: Date;

  get isPending() {
    return this.status === ENUMS.SK_FAKE_APP_STATUS.PENDING;
  }

  get isIgnored() {
    return [
      ENUMS.SK_FAKE_APP_STATUS.IGNORED,
      ENUMS.SK_FAKE_APP_STATUS.ADDED_TO_INVENTORY,
    ].includes(this.status);
  }

  get isAddedToInventory() {
    return this.status === ENUMS.SK_FAKE_APP_STATUS.ADDED_TO_INVENTORY;
  }

  get isFakeApp() {
    return this.aiClassificationLabel === 'fake_app';
  }

  get isBrandAbuse() {
    return this.aiClassificationLabel === 'brand_abuse';
  }

  get isAndroid() {
    return this.skStore?.platform === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return this.skStore?.platform === ENUMS.PLATFORM.IOS;
  }

  get isAndroidStore() {
    return this.skStore?.identifier === 'playstore';
  }

  get isIosStore() {
    return this.skStore?.identifier === 'appstore';
  }

  get isApkModyStore() {
    return this.skStore?.identifier === 'apkmody';
  }

  get isAptoideStore() {
    return this.skStore?.identifier === 'aptoide';
  }

  async ignore(ignoreReason: string) {
    const adapter = this.store.adapterFor('sk-fake-app');

    return await adapter.ignore(this, ignoreReason);
  }

  async ignoreAndAddToInventory(ignoreReason: string) {
    const adapter = this.store.adapterFor('sk-fake-app');

    return await adapter.ignoreAndAddToInventory(this, ignoreReason);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-fake-app': SkFakeAppModel;
  }
}

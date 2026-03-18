import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';

import ENUMS from 'irene/enums';
import type SkAppModel from './sk-app';
import SkInventoryAppModel from './sk-inventory-app';

export interface SkFakeAppStoreData {
  id: number;
  name: string;
  identifier: string;
  icon: string;
  platform: number;
  platformDisplay: 'android' | 'apple';
}

export interface SkFakeAppAiScores {
  final: number;
  LogoSimilarityRule?: number;
  TitleBrandAbuseRule?: number;
  PackageSimilarityRule?: number;
  SemanticSimilarityRule?: number;
  DeveloperConsistencyRule?: number;
  AppFunctionalitySimilarityRule?: number;
  LogoSimilarityRule_justification?: string;
  TitleBrandAbuseRule_justification?: string;
  PackageSimilarityRule_justification?: string;
  SemanticSimilarityRule_justification?: string;
  DeveloperConsistencyRule_justification?: string;
  AppFunctionalitySimilarityRule_justification?: string;
}

export interface SkFakeAppAiScoreLevels {
  LogoSimilarityRule: 'LOW' | 'MEDIUM' | 'HIGH';
  TitleBrandAbuseRule: 'LOW' | 'MEDIUM' | 'HIGH';
  PackageSimilarityRule: 'LOW' | 'MEDIUM' | 'HIGH';
  SemanticSimilarityRule: 'LOW' | 'MEDIUM' | 'HIGH';
  DeveloperConsistencyRule: 'LOW' | 'MEDIUM' | 'HIGH';
  AppFunctionalitySimilarityRule: 'LOW' | 'MEDIUM' | 'HIGH';
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
  declare ignoreReason: string;

  @belongsTo('sk-app', { async: true, inverse: null })
  declare addedToInventoryApp: AsyncBelongsTo<SkAppModel> | null;

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

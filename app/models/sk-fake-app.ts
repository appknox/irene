import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';

import ENUMS from 'irene/enums';
import type SkAppModel from './sk-app';

export interface SkFakeAppStoreData {
  id: number;
  name: string;
  identifier: string;
  icon: string;
  platform: number;
  platformDisplay: string;
}

export interface SkFakeAppAiScores {
  final: number;
  LogoSimilarityRule?: number;
  TitleBrandAbuseRule?: number;
  PackageSimilarityRule?: number;
  SemanticSimilarityRule?: number;
  DeveloperConsistencyRule?: number;
  AppFunctionalitySimilarityRule?: number;
  [key: string]: number | string | undefined;
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

export default class SkFakeAppModel extends Model {
  @belongsTo('sk-app', { async: true, inverse: null })
  declare skApp: AsyncBelongsTo<SkAppModel>;

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
  declare similarityScores: SkFakeAppSimilarityScores;

  @attr()
  declare signals: SkFakeAppSignals;

  @attr('number')
  declare aiConfidence: number;

  @attr('string')
  declare aiClassificationLabel: string;

  @attr()
  declare aiClassification: SkFakeAppClassification;

  @attr('string')
  declare aiClassificationJustification: string;

  @attr('boolean')
  declare hasClassificationMismatch: boolean;

  @attr()
  declare ruleBreakdown: Record<string, unknown>;

  @attr('string')
  declare reviewedBy: string;

  @attr('date')
  declare reviewedOn: Date;

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
    return this.status === ENUMS.SK_FAKE_APP_STATUS.IGNORED;
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

  async addToInventory(ignoreReason: string) {
    const adapter = this.store.adapterFor('sk-fake-app');

    return await adapter.addToInventory(this, ignoreReason);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-fake-app': SkFakeAppModel;
  }
}

import Model, { attr } from '@ember-data/model';

export type SkThirdPartyAppStore = 'appstore' | 'playstore';

export interface SkThirdPartyAppFinding {
  rule_id: string;
  name: string;
  description: string;
  severity: string;
  status: string;
  details: string[];
  skip_reason: string | null;
  category: string;
  contributes_to_score: boolean;
  checks: string;
  business_impact: string;
  is_potential_risk: boolean;
}

export default class SkThirdPartyAppModel extends Model {
  @attr('string') declare packageName: string;
  @attr('string') declare region: string;
  @attr('string') declare version: string;
  @attr('string') declare skStore: SkThirdPartyAppStore;
  @attr('number') declare score: number | null;
  @attr('number') declare riskStatus: number;
  @attr('string') declare scanDate: string;
  @attr('string') declare title: string;
  @attr('string') declare iconUrl: string;
  @attr('string') declare devName: string;
  @attr('string') declare appUrl: string;
  @attr('number') declare platform: number;
  @attr('string') declare presignedUrl: string;
  @attr() declare versions: string[];
  @attr() declare findings: SkThirdPartyAppFinding[];

  get isAndroid() {
    return this.skStore === 'playstore';
  }

  get isIos() {
    return this.skStore === 'appstore';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-third-party-app': SkThirdPartyAppModel;
  }
}

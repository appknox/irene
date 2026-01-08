import Model, { attr } from '@ember-data/model';

export interface DetailedFinding {
  title: string | null;
  description: string;
  screenshot: string;
}

export default class DetailedAnalysisModel extends Model {
  @attr
  declare findings: DetailedFinding[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'detailed-analysis': DetailedAnalysisModel;
  }
}

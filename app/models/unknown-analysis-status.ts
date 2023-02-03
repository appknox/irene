import Model, { attr } from '@ember-data/model';

export default class UnknownAnalysisStatusModel extends Model {
  @attr('boolean')
  declare status: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'unknown-analysis-status': UnknownAnalysisStatusModel;
  }
}

import Model, { attr } from '@ember-data/model';

export default class DetailedAnalysesModel extends Model {
  @attr()
  declare screenshots: string[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'detailed-analyses': DetailedAnalysesModel;
  }
}

import Model, { attr } from '@ember-data/model';

export default class ScanCoverageScreenModel extends Model {
  @attr('string')
  declare identifier: string;

  @attr('boolean')
  declare visited: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'scan-coverage-screen': ScanCoverageScreenModel;
  }
}

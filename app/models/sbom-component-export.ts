import Model, { attr } from '@ember-data/model';

export default class SbomComponentExportModel extends Model {
  @attr('number')
  declare status: number;

  @attr('string')
  declare downloadUrl: string | null;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-component-export': SbomComponentExportModel;
  }
}

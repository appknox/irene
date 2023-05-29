import Model, { AsyncBelongsTo, belongsTo } from '@ember-data/model';

import ProjectModel from './project';
import SbomScanModel from './sbom-scan';

export default class SbomAppModel extends Model {
  @belongsTo('project')
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('sbom-scan')
  declare latestSbFile: AsyncBelongsTo<SbomScanModel> | null;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-app': SbomAppModel;
  }
}

import Model, { AsyncBelongsTo, belongsTo } from '@ember-data/model';

import ProjectModel from './project';
import SbomFileModel from './sbom-file';

export default class SbomProjectModel extends Model {
  @belongsTo('project')
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('sbom-file')
  declare latestSbFile: AsyncBelongsTo<SbomFileModel> | null;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-project': SbomProjectModel;
  }
}

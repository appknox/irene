import Model, { AsyncBelongsTo, belongsTo } from '@ember-data/model';

import ProjectModel from './project';
import SbomFileModel from './sbom-file';

export default class SbomProjectModel extends Model {
  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('sbom-file', { async: true, inverse: null })
  declare latestSbFile: AsyncBelongsTo<SbomFileModel> | null;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-project': SbomProjectModel;
  }
}

import type { AsyncBelongsTo } from '@ember-data/model';
import Model, { belongsTo } from '@ember-data/model';

import type ProjectModel from './project';
import type SbomFileModel from './sbom-file';

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

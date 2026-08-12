import Model, { attr, AsyncBelongsTo, belongsTo } from '@ember-data/model';

import ProjectModel from './project';
import SbomFileModel from './sbom-file';

export default class SbomProjectModel extends Model {
  @attr('date')
  declare lastScaAnalysisOn: Date | null;

  @attr('string')
  declare name: string;

  @attr('string')
  declare packageName: string;

  @attr('string')
  declare iconUrl: string;

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

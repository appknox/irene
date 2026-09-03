import Model, { attr, AsyncBelongsTo, belongsTo } from '@ember-data/model';

import ProjectModel from './project';
import SbomFileModel from './sbom-file';

type SbomProjectStatus = 'VULNERABLE' | 'SECURE';

export default class SbomProjectModel extends Model {
  @attr('date')
  declare lastScaAnalysisOn: Date | null;

  @attr('string')
  declare name: string;

  @attr('string')
  declare packageName: string;

  @attr('string')
  declare iconUrl: string;

  // Common field (returned in both default and history modes)
  @attr('string')
  declare dependencyType: string | null;

  // History-mode fields (present only when ?history=true)
  @attr('number')
  declare vulnerabilitiesCount: number | null;

  @attr('string')
  declare status: SbomProjectStatus | null;

  @attr('date')
  declare compositionScanCompletedAt: Date | null;

  @attr('date')
  declare vulnerabilityScanCompletedAt: Date | null;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('sbom-file', { async: true, inverse: null })
  declare latestSbFile: AsyncBelongsTo<SbomFileModel> | null;

  // History mode: the specific scan's sbom-file (vs latestSbFile in default mode)
  @belongsTo('sbom-file', { async: true, inverse: null })
  declare sbFile: AsyncBelongsTo<SbomFileModel> | null;

  get isVulnerable() {
    return this.status === 'VULNERABLE';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-project': SbomProjectModel;
  }
}

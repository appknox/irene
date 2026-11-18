import Model, { attr, belongsTo } from '@ember-data/model';
import type { AsyncBelongsTo } from '@ember-data/model';
import type ProjectModel from './project';
import type SbomFileModel from './sbom-file';

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

  // List fields: what a row shows, so it does not load the project and its
  // last file one by one. Absent from older backends and from history rows;
  // the row components then fall back to the project and file records.
  @attr('number')
  declare platform: number | null;

  @attr('string')
  declare latestFileName: string | null;

  @attr('string')
  declare latestFileIconUrl: string | null;

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

  // History mode: the specific scan's sbom-file ID (vs latestSbFile in default mode)
  @attr('number')
  declare sbFile: number | null;

  get isVulnerable() {
    return this.status === 'VULNERABLE';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-project': SbomProjectModel;
  }
}

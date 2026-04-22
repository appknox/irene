import Model, { attr } from '@ember-data/model';

/**
 * One policy check row inside `findings`. Nested keys stay snake_case as in the API;
 * only top-level scan fields are camelized by the application DRF serializer.
 */
export interface StoreReleaseReadinessScanFinding {
  id: number;
  check_id: string;
  title: string;
  category: string;
  severity: number;
  passed: boolean | null;
  evidence: string;
  remediation_steps: string[];
  guideline_reference: string;
  platform: number;
  explanation: string;
  source: string;
  field_checked: string;
  expected: string;
  signal_enriched: boolean;
  enrichment_details: Record<string, unknown>;
  is_overridden: boolean;
  overridden_by: string | null;
  overridden_at: string | null;
  override_comment: string;
  created_at: string;
}

export default class StoreReleaseReadinessScanModel extends Model {
  @attr('number')
  declare fileId: number;

  @attr('string')
  declare fileName: string;

  @attr('number')
  declare projectId: number;

  @attr('string')
  declare packageName: string;

  @attr('number')
  declare platform: number;

  @attr('number')
  declare status: number;

  @attr('number')
  declare verdict: number;

  @attr('string')
  declare verdictDisplay: string;

  @attr('number')
  declare totalChecks: number;

  @attr('number')
  declare passedCount: number;

  @attr('number')
  declare failedCount: number;

  @attr('number')
  declare blockerCount: number;

  @attr('number')
  declare warningCount: number;

  @attr('number')
  declare untestedCount: number;

  @attr('date')
  declare createdAt: Date | null;

  @attr('date')
  declare completedAt: Date | null;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare errorMessage: string | null;

  @attr('date')
  declare updatedAt: Date | null;

  /** Present on detail `findRecord` responses; omitted on list payloads. */
  @attr()
  declare findings: StoreReleaseReadinessScanFinding[] | undefined;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'store-release-readiness-scan': StoreReleaseReadinessScanModel;
  }
}

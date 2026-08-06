import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import type FileModel from './file';

export interface HealthScoreAuditTrailEntry {
  id: number;
  score: number | null;
  previous_score: number | null;
  score_change: number | null;
  score_type: string;
  status: string;
  trend: string | null;
  event_type: string;
  event_description: string;
  calculated_at: string;
  coverage_ceiling: number;
  coverage_level: string;
  completed_scans: string[];
  pending_scans: string[];
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  ignored_count: number;
  critical_risk: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  accepted_risk_cap: number | null;
  knoxiq_enabled: boolean;
  knoxiq_ran: boolean;
  severity_overrides_count: number;
}

export interface HealthScoreCurrentScore {
  knoxiq_enabled: boolean;
  score: number | null;
  score_type: string;
  status: string;
}

export default class FileHealthScoreAuditModel extends Model {
  @attr({ defaultValue: () => [] })
  declare auditTrail: HealthScoreAuditTrailEntry[];

  @attr({
    defaultValue: () => ({
      knoxiq_enabled: false,
      score: null,
      score_type: '',
      status: '',
    }),
  })
  declare currentScore: HealthScoreCurrentScore;

  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'file-health-score-audit': FileHealthScoreAuditModel;
  }
}

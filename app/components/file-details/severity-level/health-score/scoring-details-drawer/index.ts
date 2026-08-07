import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type {
  HealthScoreAuditTrailEntry,
  HealthScoreCurrentScore,
} from 'irene/models/file-health-score-audit';

export interface ScoringDetailsTimelineEntry {
  id: string | number;
  dateLabel: string;
  title: string;
  description: string;
  coverageLabel: string | null;
  scoreChange: string;
  scoreChangeClass: string;
  isLatest: boolean;
  isKnoxiqRan: boolean;
  isBase: boolean;
}

export interface FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerSignature {
  Element: HTMLElement;
  Args: {
    open: boolean;
    onClose: () => void;
    fileId?: string;
    currentScore: HealthScoreCurrentScore | null;
    auditTrail: HealthScoreAuditTrailEntry[];
  };
}

const BASE_SCORE = 100;

/**
 * Converts a snake_case token into a space-separated Title Case label
 * (e.g. `very_poor` -> `Very Poor`).
 */
export function humanizeSnakeCase(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const SCAN_TYPE_TITLES: Record<string, string> = {
  sast: 'SAST Scan',
  dast: 'DAST Scan',
  api: 'API Scan',
  manual: 'Manual Scan',
};

const SCAN_TYPE_RUN_KEYS: Record<string, string> = {
  sast: 'sastRunTitle',
  dast: 'dastRunTitle',
  api: 'apiRunTitle',
  manual: 'manualRunTitle',
};

const SCAN_TYPE_SHORT_LABELS: Record<string, string> = {
  sast: 'SAST',
  dast: 'DAST',
  api: 'API',
  manual: 'Manual',
};

export default class FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerComponent extends Component<FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerSignature> {
  @service declare intl: IntlService;

  @tracked showScoringMethodology = false;

  @action
  toggleScoringMethodology() {
    this.showScoringMethodology = !this.showScoringMethodology;
  }

  get score() {
    return this.args.currentScore?.score ?? null;
  }

  get scoreBoxGradient(): string {
    const score = this.score;

    if (score === null) {
      return '';
    }

    let start: string;
    let end: string;

    if (score >= 90) {
      start = '#43A047';
      end = '#2DB421';
    } else if (score >= 75) {
      start = '#A8D65E';
      end = '#94C436';
    } else if (score >= 60) {
      start = '#FBD54A';
      end = '#FAD34A';
    } else if (score >= 40) {
      start = '#FB9E5E';
      end = '#F98746';
    } else {
      start = '#E53935';
      end = '#D72F2F';
    }

    return `linear-gradient(135deg, ${start}, ${end})`;
  }

  get statusLabel() {
    return humanizeSnakeCase(this.args.currentScore?.status ?? '');
  }

  get statusChipClass() {
    return (this.args.currentScore?.status ?? '').replace(/_/g, '-');
  }

  get modeLabel() {
    return this.args.currentScore?.knoxiq_enabled
      ? this.intl.t('standardKnoxiqScoring')
      : this.intl.t('standardScoring');
  }

  get timelineEntries(): ScoringDetailsTimelineEntry[] {
    const baseEntry: ScoringDetailsTimelineEntry = {
      id: 'base',
      dateLabel: this.intl.t('startingPoint'),
      title: this.intl.t('baseScore'),
      description: this.intl.t('baseScoreDescription'),
      coverageLabel: null,
      scoreChange: `+${BASE_SCORE}`,
      scoreChangeClass: 'positive',
      isLatest: false,
      isKnoxiqRan: false,
      isBase: true,
    };

    const trail = this.args.auditTrail;
    const lastIndex = trail.length - 1;
    const typeCounts = this.scanTypeCounts(trail);
    const runNumbers: Record<string, number> = {};

    const entries = trail.map((entry, index) => {
      const type = this.scanType(entry.event_type);
      runNumbers[type] = (runNumbers[type] ?? 0) + 1;

      const runNumber = (typeCounts[type] ?? 0) > 1 ? runNumbers[type] : null;

      return this.toTimelineEntry(entry, type, runNumber, index === lastIndex);
    });

    return [baseEntry, ...entries];
  }

  private scanTypeCounts(trail: HealthScoreAuditTrailEntry[]) {
    return trail.reduce<Record<string, number>>((acc, entry) => {
      const type = this.scanType(entry.event_type);
      acc[type] = (acc[type] ?? 0) + 1;

      return acc;
    }, {});
  }

  private toTimelineEntry(
    entry: HealthScoreAuditTrailEntry,
    type: string,
    runNumber: number | null,
    isLatest: boolean
  ): ScoringDetailsTimelineEntry {
    const previousScore = entry.previous_score ?? BASE_SCORE;
    const delta = (entry.score ?? previousScore) - previousScore;

    return {
      id: entry.id,
      dateLabel: this.dateLabelFor(entry),
      title: this.titleFor(entry, type, runNumber),
      description: entry.event_description,
      coverageLabel:
        type === 'dast' && entry.coverage_ceiling
          ? `${entry.coverage_ceiling}%`
          : null,
      scoreChange: delta > 0 ? `+${delta}` : `${delta}`,
      scoreChangeClass: this.scoreChangeClass(delta),
      isLatest,
      isKnoxiqRan: entry.knoxiq_ran,
      isBase: false,
    };
  }

  private dateLabelFor(entry: HealthScoreAuditTrailEntry) {
    const formatted = dayjs(entry.calculated_at).format(
      'MMM DD, YYYY · h:mm A'
    );

    return `${formatted} · ${this.intl.t('completed')}`;
  }

  private scanType(eventType: string) {
    return eventType.split('_')[0] ?? '';
  }

  private titleFor(
    entry: HealthScoreAuditTrailEntry,
    type: string,
    runNumber: number | null
  ) {
    if (entry.knoxiq_ran) {
      const scanType = SCAN_TYPE_SHORT_LABELS[type] ?? humanizeSnakeCase(type);

      return this.intl.t('knoxiqOnScan', { scanType });
    }

    const baseTitle =
      SCAN_TYPE_TITLES[type] ?? humanizeSnakeCase(entry.event_type);

    if (runNumber == null) {
      return baseTitle;
    }

    const runKey = SCAN_TYPE_RUN_KEYS[type];

    return runKey
      ? this.intl.t(runKey, { run: runNumber })
      : `${baseTitle} · Run ${runNumber}`;
  }

  private scoreChangeClass(delta: number) {
    if (delta > 0) {
      return 'positive';
    }

    return delta < 0 ? 'negative' : 'neutral';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SeverityLevel::HealthScore::ScoringDetailsDrawer': typeof FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerComponent;
    'file-details/severity-level/health-score/scoring-details-drawer': typeof FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerComponent;
  }
}

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
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

export const SCORE_STATUS_KEYS: Record<string, string> = {
  very_poor: 'healthScore.scoringMethodology.ratingVeryPoor',
  poor: 'healthScore.scoringMethodology.ratingPoor',
  fair: 'healthScore.scoringMethodology.ratingFair',
  good: 'healthScore.scoringMethodology.ratingGood',
  excellent: 'healthScore.scoringMethodology.ratingExcellent',
};

const SCAN_TYPE_TITLE_KEYS: Record<string, string> = {
  sast: 'healthScore.sastRunTitle',
  dast: 'dastTitle',
  api: 'apiScan',
  manual: 'manualScan',
};

const SCAN_TYPE_RUN_KEYS: Record<string, string> = {
  sast: 'healthScore.sastRunTitle',
  dast: 'healthScore.dastRunTitle',
  api: 'healthScore.apiRunTitle',
  manual: 'healthScore.manualRunTitle',
};

const SCAN_TYPE_SHORT_KEYS: Record<string, string> = {
  sast: 'sast',
  dast: 'dast',
  api: 'api',
  manual: 'manual',
};

export default class FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerComponent extends Component<FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerSignature> {
  @service declare intl: IntlService;

  @tracked showScoringMethodology = false;

  HEALTH_SCORE_TOTAL_VALUE = 100;

  get score() {
    return this.args.currentScore?.score ?? null;
  }

  get statusLabel() {
    const status = this.args.currentScore?.status ?? '';
    const key = SCORE_STATUS_KEYS[status];

    return key ? this.intl.t(key) : '';
  }

  get statusChipClass() {
    return (this.args.currentScore?.status ?? '').replaceAll('_', '-');
  }

  get modeLabel() {
    return this.args.currentScore?.knoxiq_enabled
      ? this.intl.t('healthScore.standardKnoxiqScoring')
      : this.intl.t('healthScore.standardScoring');
  }

  get timelineEntries(): ScoringDetailsTimelineEntry[] {
    const baseEntry: ScoringDetailsTimelineEntry = {
      id: 'base',
      dateLabel: this.intl.t('healthScore.startingPoint'),
      title: this.intl.t('healthScore.baseScore'),
      description: this.intl.t('healthScore.baseScoreDescription'),
      coverageLabel: null,
      scoreChange: `+${this.HEALTH_SCORE_TOTAL_VALUE}`,
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

  @action
  toggleScoringMethodology() {
    this.showScoringMethodology = !this.showScoringMethodology;
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
    const previousScore = entry.previous_score ?? this.HEALTH_SCORE_TOTAL_VALUE;
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
      const shortKey = SCAN_TYPE_SHORT_KEYS[type];
      const scanType = shortKey ? this.intl.t(shortKey) : type;

      return this.intl.t('healthScore.knoxiqOnScan', { scanType });
    }

    const titleKey = SCAN_TYPE_TITLE_KEYS[type];
    const baseTitle = titleKey ? this.intl.t(titleKey) : entry.event_type;

    if (runNumber == null) {
      return baseTitle;
    }

    const runKey = SCAN_TYPE_RUN_KEYS[type];

    return runKey
      ? this.intl.t(runKey, { run: runNumber })
      : this.intl.t('healthScore.unknownRunTitle', {
          title: baseTitle,
          run: runNumber,
        });
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

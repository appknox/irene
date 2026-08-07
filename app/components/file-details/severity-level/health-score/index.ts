import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import { humanizeSnakeCase } from 'irene/components/file-details/severity-level/health-score/scoring-details-drawer';

import type FileModel from 'irene/models/file';
import type FileHealthScoreAuditModel from 'irene/models/file-health-score-audit';
import type LoggerService from 'irene/services/logger';

export interface FileDetailsSeverityLevelHealthScoreSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    isCompact?: boolean;
  };
}

const MAX_SCORE = 100;

export default class FileDetailsSeverityLevelHealthScoreComponent extends Component<FileDetailsSeverityLevelHealthScoreSignature> {
  @service declare logger: LoggerService;

  @tracked healthScoreAudit: FileHealthScoreAuditModel | null = null;
  @tracked isScoringDetailsDrawerOpen = false;

  constructor(
    owner: unknown,
    args: FileDetailsSeverityLevelHealthScoreSignature['Args']
  ) {
    super(owner, args);

    this.fetchHealthScoreAudit.perform();
  }

  get maxScore() {
    return MAX_SCORE;
  }

  get isCompact() {
    return this.args.isCompact ?? false;
  }

  get isFetching() {
    return this.fetchHealthScoreAudit.isRunning;
  }

  get currentScore() {
    return this.healthScoreAudit?.currentScore ?? null;
  }

  get auditTrail() {
    return this.healthScoreAudit?.auditTrail ?? [];
  }

  get hasHealthScore() {
    return this.currentScore != null && this.currentScore.score != null;
  }

  get shouldShow() {
    return this.isFetching || this.hasHealthScore;
  }

  get score() {
    return this.currentScore?.score ?? null;
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

  get status() {
    return this.currentScore?.status ?? '';
  }

  get statusLabel() {
    return humanizeSnakeCase(this.status);
  }

  get statusChipClass() {
    return this.status.replace(/_/g, '-');
  }

  @action
  openScoringDetailsDrawer() {
    this.isScoringDetailsDrawerOpen = true;
  }

  @action
  closeScoringDetailsDrawer() {
    this.isScoringDetailsDrawerOpen = false;
  }

  fetchHealthScoreAudit = task(async () => {
    try {
      this.healthScoreAudit = await waitForPromise(
        this.args.file.fetchFileHealthScoreAudit()
      );
    } catch (error) {
      const err = error as AdapterError;
      const isRateLimitError = Number(err.errors?.[0]?.status) === 429;

      if (!isRateLimitError) {
        this.logger.error(error);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SeverityLevel::HealthScore': typeof FileDetailsSeverityLevelHealthScoreComponent;
    'file-details/severity-level/health-score': typeof FileDetailsSeverityLevelHealthScoreComponent;
  }
}

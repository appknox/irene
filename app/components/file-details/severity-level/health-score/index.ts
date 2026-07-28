import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import { SCORE_STATUS_KEYS } from 'irene/components/file-details/severity-level/health-score/scoring-details-drawer';

import type FileModel from 'irene/models/file';
import type FileHealthScoreAuditModel from 'irene/models/file-health-score-audit';
import type IntlService from 'ember-intl/services/intl';
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
  @service declare intl: IntlService;
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

  get status() {
    return this.currentScore?.status ?? '';
  }

  get statusLabel() {
    const key = SCORE_STATUS_KEYS[this.status];

    return key ? this.intl.t(key) : '';
  }

  get statusChipClass() {
    return this.status.replaceAll('_', '-');
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

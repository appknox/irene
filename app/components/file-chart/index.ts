import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import { type ECOption } from 'irene/components/ak-chart';
import type FileModel from 'irene/models/file';
import type FileRiskModel from 'irene/models/file-risk';
import type LoggerService from 'irene/services/logger';

export interface FileChartSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    legendMaxWidth?: string | number;
    size?: 'small' | 'large';
  };
}

export default class FileChartComponent extends Component<FileChartSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare logger: LoggerService;
  @service('notifications') declare notify: NotificationService;

  @tracked fileRisk: FileRiskModel | null = null;

  constructor(owner: unknown, args: FileChartSignature['Args']) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get isLargeChartSize() {
    return this.args.size === 'large';
  }

  get isFetchingFileRisk() {
    return this.fetchFileRisk.isRunning;
  }

  get severityLevelCounts() {
    const severityCountObjects = [
      {
        value: this.fileRisk?.get('riskCountCritical'),
        name: this.intl.t('critical'),
        severityType: 'critical',
      },
      {
        value: this.fileRisk?.get('riskCountHigh'),
        name: this.intl.t('high'),
        severityType: 'high',
      },
      {
        value: this.fileRisk?.get('riskCountMedium'),
        name: this.intl.t('medium'),
        severityType: 'medium',
      },
      {
        value: this.fileRisk?.get('riskCountLow'),
        name: this.intl.t('low'),
        severityType: 'low',
      },
      {
        value: this.fileRisk?.get('riskCountPassed'),
        name: this.intl.t('passed'),
        severityType: 'passed',
        hasOverridenPassedRisks: this.hasOverridenPassedRisks,
      },
    ];

    if (this.showUnknownAnalysis) {
      severityCountObjects.push({
        value: this.fileRisk?.get('riskCountUnknown'),
        name: this.intl.t('untested'),
        severityType: 'none',
      });
    }

    return severityCountObjects;
  }

  get overridenPassedRiskCount() {
    return this.fileRisk?.get('overriddenPassedRiskCount') || 0;
  }

  get hasOverridenPassedRisks() {
    return this.overridenPassedRiskCount > 0;
  }

  get totalRiskCount() {
    return this.severityLevelCounts.reduce(
      (acc, curr) => acc + Number(curr?.value),
      0
    );
  }

  get option(): ECOption {
    return {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: ['65%', '100%'],
          label: { show: false },
          color: this.severityLevelCounts.map((slc) => {
            const colorVar =
              this.totalRiskCount === 0 ? 'empty' : slc.severityType;

            return getComputedStyle(document.body).getPropertyValue(
              `--file-chart-severity-level-color-${colorVar}`
            );
          }),
          emphasis: { scale: false },
          // if zero sum then show empty circle
          data: this.severityLevelCounts,
        },
      ],
    };
  }

  get legendMaxWidth() {
    return this.args.legendMaxWidth || 350;
  }

  get showUnknownAnalysis() {
    return this.args.file?.get('project')?.get('showUnknownAnalysis');
  }

  fetchFileRisk = task(async () => {
    if (!this.args.file) {
      return;
    }

    const fileId = String(this.args.file.id);

    try {
      // Check if it's in the store (to avoid duplicate requests)
      const existingRisk = this.store.peekRecord('file-risk', fileId);

      if (existingRisk) {
        this.fileRisk = existingRisk;

        return;
      }

      // Fetch from API - this will use /files/{id}/risk endpoint
      this.fileRisk = await this.store.findRecord('file-risk', fileId);
    } catch (error) {
      const err = error as AdapterError;

      const errorStatus = err.errors?.[0]?.status;
      const isRateLimitError = Number(errorStatus) === 429;

      if (!isRateLimitError) {
        this.logger.error(
          `Failed to fetch file risk for file - ${this.args.file?.id}`,
          error
        );
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileChart: typeof FileChartComponent;
    'file-chart': typeof FileChartComponent;
  }
}

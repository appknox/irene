import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import { type ECOption } from 'irene/components/ak-chart';
import type FileModel from 'irene/models/file';
import type FileRiskModel from 'irene/models/file-risk';

export interface FileChartSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    legendMaxWidth?: string | number;
  };
}

export default class FileChartComponent extends Component<FileChartSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked fileRisk: FileRiskModel | null = null;

  constructor(owner: unknown, args: FileChartSignature['Args']) {
    super(owner, args);

    this.fetchFileRisk.perform();
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
          label: {
            show: false,
          },
          color: this.severityLevelCounts.map((slc) =>
            getComputedStyle(document.body).getPropertyValue(
              `--file-chart-severity-level-color-${slc.severityType}`
            )
          ),
          emphasis: { scale: false },
          // if zero sum then show empty circle
          data: this.totalRiskCount > 0 ? this.severityLevelCounts : [],
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
    try {
      if (this.args.file) {
        this.fileRisk = await this.args.file.fetchFileRisk();
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileChart: typeof FileChartComponent;
    'file-chart': typeof FileChartComponent;
  }
}

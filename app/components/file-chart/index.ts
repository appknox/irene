import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import { type ECOption } from 'irene/components/ak-chart';
import type FileModel from 'irene/models/file';

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

  get severityLevelCounts() {
    const file = this.args.file;

    const severityCountObjects = [
      {
        value: file?.get('countRiskCritical'),
        name: this.intl.t('critical'),
        severityType: 'critical',
      },
      {
        value: file?.get('countRiskHigh'),
        name: this.intl.t('high'),
        severityType: 'high',
      },
      {
        value: file?.get('countRiskMedium'),
        name: this.intl.t('medium'),
        severityType: 'medium',
      },
      {
        value: file?.get('countRiskLow'),
        name: this.intl.t('low'),
        severityType: 'low',
      },
      {
        value: file?.get('countRiskNone'),
        name: this.intl.t('passed'),
        severityType: 'passed',
        hasOverridenPassedRisks: this.hasOverridenPassedRisks,
      },
    ];

    if (this.showUnknownAnalysis) {
      severityCountObjects.push({
        value: file?.get('countRiskUnknown'),
        name: this.intl.t('untested'),
        severityType: 'none',
      });
    }

    return severityCountObjects;
  }

  get overridenPassedRiskCount() {
    return (
      this.args.file
        ?.get('analyses')
        .reduce(
          (count, a) =>
            a.isOverriddenAsPassed && a.status === ENUMS.ANALYSIS.COMPLETED
              ? count + 1
              : count,
          0
        ) || 0
    );
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileChart: typeof FileChartComponent;
    'file-chart': typeof FileChartComponent;
  }
}

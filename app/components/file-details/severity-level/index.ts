import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

import { ECOption } from 'irene/components/ak-chart';
import FileModel from 'irene/models/file';
import { tracked } from '@glimmer/tracking';
import UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';

export interface FileDetailsSeverityLevelSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSeverityLevelComponent extends Component<FileDetailsSeverityLevelSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked unknownAnalysisStatus?: UnknownAnalysisStatusModel;

  constructor(owner: unknown, args: FileDetailsSeverityLevelSignature['Args']) {
    super(owner, args);

    this.fetchUnknownAnalysisStatus.perform();
  }

  get severityLevelCounts() {
    const file = this.args.file;

    const severityCountObjects = [
      {
        value: file.countRiskCritical,
        name: this.intl.t('critical'),
        severityType: 'critical',
      },
      {
        value: file.countRiskHigh,
        name: this.intl.t('high'),
        severityType: 'high',
      },
      {
        value: file.countRiskMedium,
        name: this.intl.t('medium'),
        severityType: 'medium',
      },
      {
        value: file.countRiskLow,
        name: this.intl.t('low'),
        severityType: 'low',
      },
      {
        value: file.countRiskNone,
        name: this.intl.t('passed'),
        severityType: 'passed',
      },
    ];

    if (this.unknownAnalysisStatus?.status) {
      severityCountObjects.push({
        value: file.countRiskUnknown,
        name: this.intl.t('untested'),
        severityType: 'none',
      });
    }

    return severityCountObjects;
  }

  get totalRiskCount() {
    return this.severityLevelCounts.reduce((acc, curr) => acc + curr.value, 0);
  }

  get option(): ECOption {
    return {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: ['70%', '100%'],
          label: {
            show: false,
          },
          color: this.severityLevelCounts.map((slc) =>
            getComputedStyle(document.body).getPropertyValue(
              `--file-details-severity-level-color-${slc.severityType}`
            )
          ),
          emphasis: { scale: false },
          // if zero sum then show empty circle
          data: this.totalRiskCount > 0 ? this.severityLevelCounts : [],
        },
      ],
    };
  }

  fetchUnknownAnalysisStatus = task(async () => {
    this.unknownAnalysisStatus = await this.store.queryRecord(
      'unknown-analysis-status',
      {
        id: this.args.file.profile.get('id'),
      }
    );
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SeverityLevel': typeof FileDetailsSeverityLevelComponent;
    'file-details/severity-level': typeof FileDetailsSeverityLevelComponent;
  }
}

import Store from 'ember-data/store';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { type Placement } from '@popperjs/core';
import type IntlService from 'ember-intl/services/intl';

import type PartnerService from 'irene/services/partner';
import type PartnerclientFileSummaryModel from 'irene/models/partner/partnerclient-file-summary';

interface PartnerClientReportSummaryComponentSignature {
  Element: HTMLElement;
  Args: {
    clientId: string;
    fileId: string;
    indexPlacement: Placement;
  };
}

export default class PartnerClientReportSummaryComponent extends Component<PartnerClientReportSummaryComponentSignature> {
  @service declare partner: PartnerService;
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked fileSummary: PartnerclientFileSummaryModel | null = null;

  get popoverPlacement() {
    return this.args.indexPlacement ? this.args.indexPlacement : 'top';
  }

  riskWidth(riskPercent?: number) {
    return `${riskPercent}%`;
  }

  get riskProps() {
    return [
      {
        key: 'critical',
        label: this.intl.t('critical'),
        width: this.riskWidth(this.fileSummary?.criticalPercent),
        riskCount: this.fileSummary?.riskCountCritical,
      },
      {
        key: 'high',
        label: this.intl.t('high'),
        width: this.riskWidth(this.fileSummary?.highPercent),
        riskCount: this.fileSummary?.riskCountHigh,
      },
      {
        key: 'medium',
        label: this.intl.t('medium'),
        width: this.riskWidth(this.fileSummary?.mediumPercent),
        riskCount: this.fileSummary?.riskCountMedium,
      },
      {
        key: 'low',
        label: this.intl.t('low'),
        width: this.riskWidth(this.fileSummary?.lowPercent),
        riskCount: this.fileSummary?.riskCountLow,
      },
      {
        key: 'passed',
        label: this.intl.t('passed'),
        width: this.riskWidth(this.fileSummary?.passedPercent),
        riskCount: this.fileSummary?.riskCountPassed,
      },
      {
        key: 'untested',
        label: this.intl.t('untested'),
        width: this.riskWidth(this.fileSummary?.untestedPercent),
        riskCount: this.fileSummary?.riskCountUntested,
      },
    ];
  }

  getFileSummary = task(async () => {
    try {
      this.fileSummary = await this.store.queryRecord(
        'partner/partnerclient-file-summary',
        {
          clientId: this.args.clientId,
          fileId: this.args.fileId,
        }
      );
    } catch (err) {
      this.fileSummary = null;
      return;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientReportSummary': typeof PartnerClientReportSummaryComponent;
  }
}

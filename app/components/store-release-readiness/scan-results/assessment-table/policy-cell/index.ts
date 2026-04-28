import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AssessmentPolicyRow } from '../..';

import './index.scss';

export interface StoreReleaseReadinessScanResultsAssessmentTablePolicyCellSignature {
  Element: HTMLDivElement;
  Args: {
    data: AssessmentPolicyRow;
  };
}

export default class StoreReleaseReadinessScanResultsAssessmentTablePolicyCellComponent extends Component<StoreReleaseReadinessScanResultsAssessmentTablePolicyCellSignature> {
  @service declare intl: IntlService;

  get categoryLabel() {
    const d = this.args.data;

    if (d.categoryLabel != null && d.categoryLabel !== '') {
      return d.categoryLabel;
    }

    return this.intl.t(
      `storeReleaseReadinessModule.${d.categoryKey as string}`
    );
  }

  get titleLabel() {
    const d = this.args.data;

    if (d.titleLabel != null && d.titleLabel !== '') {
      return d.titleLabel;
    }

    return this.intl.t(`storeReleaseReadinessModule.${d.titleKey as string}`);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::AssessmentTable::PolicyCell': typeof StoreReleaseReadinessScanResultsAssessmentTablePolicyCellComponent;
  }
}

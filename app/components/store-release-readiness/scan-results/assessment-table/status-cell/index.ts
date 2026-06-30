import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkIconVariantType } from 'ak-icons';

import ENUMS from 'irene/enums';

import type { AssessmentPolicyRow } from '../..';

const FINDING_SEVERITY = ENUMS.STORE_RELEASE_FINDING_SEVERITY;

export interface StoreReleaseReadinessScanResultsAssessmentTableStatusCellSignature {
  Element: HTMLDivElement;
  Args: {
    data: AssessmentPolicyRow;
    showOverriddenEditIcon?: boolean;
  };
}

export default class StoreReleaseReadinessScanResultsAssessmentTableStatusCellComponent extends Component<StoreReleaseReadinessScanResultsAssessmentTableStatusCellSignature> {
  @service declare intl: IntlService;

  get showOverriddenEditIcon() {
    return this.args.showOverriddenEditIcon ?? true;
  }

  get showEditIcon() {
    return !!(this.args.data.isOverridden && this.showOverriddenEditIcon);
  }

  get showFailedToPassIcon() {
    return !!(this.args.data.isOverridden && !this.showOverriddenEditIcon);
  }

  get isFailed() {
    return this.args.data.status === 'failed';
  }

  get isPassed() {
    return this.args.data.status === 'passed';
  }

  get failedSeverityChip(): {
    iconName: AkIconVariantType;
    label: string;
  } | null {
    const row = this.args.data;

    if (row.status !== 'failed') {
      return null;
    }

    const severity = row.severity;

    if (
      severity !== FINDING_SEVERITY.BLOCKER &&
      severity !== FINDING_SEVERITY.WARNING
    ) {
      return null;
    }

    const isBlocker = severity === FINDING_SEVERITY.BLOCKER;

    return {
      iconName: isBlocker ? 'block' : 'error',
      label: isBlocker
        ? this.intl.t('storeReleaseReadiness.summaryBlocker')
        : this.intl.t('storeReleaseReadiness.summaryWarning'),
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::AssessmentTable::StatusCell': typeof StoreReleaseReadinessScanResultsAssessmentTableStatusCellComponent;
  }
}

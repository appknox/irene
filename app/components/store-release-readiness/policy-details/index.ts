import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type {
  AssessmentPolicyRow,
  AssessmentPolicyRowStatus,
} from 'irene/components/store-release-readiness/scan-results';
import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';
import type MeService from 'irene/services/me';
import styles from './index.scss';

export interface StoreReleaseReadinessPolicyDetailsSignature {
  Args: {
    policy?: AssessmentPolicyRow;
    finding: StoreReleaseReadinessFindingModel;
  };
}

type PolicyIntroSectionId = 'violation' | 'evidence' | 'policyReference';

type PolicyIntroSection = {
  id: PolicyIntroSectionId;
  heading: string;
  isLink: boolean;
};

type PolicyDrawerConfig = {
  id: 'ignored' | 'confirmation';
  open: boolean;
  onClose: () => void;
  title: string;
  isOverridden: boolean;
};

type SummaryHeaderChip = {
  variant: 'failed-edit' | 'override-description';
  iconName: 'edit' | 'description';
  onClick: () => void;
};

export default class StoreReleaseReadinessPolicyDetailsComponent extends Component<StoreReleaseReadinessPolicyDetailsSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;

  @tracked showIgnoredDrawer = false;
  @tracked showConfirmationDrawer = false;

  get showFailedEditChip(): boolean {
    return this.statusData.status === 'failed' && !!this.me?.org?.is_admin;
  }

  get showOverrideDescriptionChip(): boolean {
    return this.statusData.isOverridden === true && !!this.me?.org?.is_admin;
  }

  get usesStructuredFindingExplanation(): boolean {
    return this.showFailedEditChip || this.showOverrideDescriptionChip;
  }

  get summaryHeaderActionChips(): SummaryHeaderChip[] {
    const chips: SummaryHeaderChip[] = [];

    if (this.showFailedEditChip) {
      chips.push({
        variant: 'failed-edit',
        iconName: 'edit',
        onClick: this.openConfirmationDrawer,
      });
    }

    if (this.showOverrideDescriptionChip) {
      chips.push({
        variant: 'override-description',
        iconName: 'description',
        onClick: this.openIgnoredDrawer,
      });
    }

    return chips;
  }

  get policyIntroSections(): PolicyIntroSection[] {
    const isPassed =
      this.statusData.status === 'passed' && !this.statusData.isOverridden;

    return [
      isPassed && {
        id: 'evidence',
        heading: this.intl.t('storeReleaseReadiness.evidence'),
        isLink: false,
      },
      !isPassed && {
        id: 'violation',
        heading: this.intl.t('storeReleaseReadiness.violationDetails'),
        isLink: false,
      },
      {
        id: 'policyReference',
        heading: this.intl.t('storeReleaseReadiness.policyReference'),
        isLink: true,
      },
    ].filter(Boolean) as PolicyIntroSection[];
  }

  get wideDrawerContainerClass(): string {
    return styles['policy-details-wide-drawer-container'] ?? '';
  }

  get policyDrawers(): PolicyDrawerConfig[] {
    return [
      {
        id: 'ignored',
        open: this.showIgnoredDrawer,
        onClose: this.closeIgnoredDrawer,
        title: this.intl.t('storeReleaseReadiness.overrideIgnoreDrawerTitle'),
        isOverridden: true,
      },
      {
        id: 'confirmation',
        open: this.showConfirmationDrawer,
        onClose: this.closeConfirmationDrawer,
        title: this.intl.t('storeReleaseReadiness.overrideConfirmDrawerTitle'),
        isOverridden: false,
      },
    ];
  }

  get remediationStepsNumbered(): { n: number; text: string }[] {
    return this.remediationSteps.map((text, i) => ({
      n: i + 1,
      text,
    }));
  }

  get statusData(): AssessmentPolicyRow {
    const policy = this.args.policy;
    const finding = this.args.finding;

    if (policy) {
      return {
        ...policy,
        severity: policy.severity ?? finding.severity,
        isOverridden: policy.isOverridden ?? finding.isOverridden,
      };
    }

    const passed = finding.passed;
    let status: AssessmentPolicyRowStatus;

    if (passed === false) {
      status = 'failed';
    } else if (passed === true) {
      status = 'passed';
    } else {
      status = 'untested';
    }

    return {
      id: String(finding.id),
      categoryLabel: finding.category,
      titleLabel: finding.title,
      status,
      severity: finding.severity,
      isOverridden: finding.isOverridden,
    };
  }

  get titleLabel(): string {
    return this.statusData.titleLabel ?? '';
  }

  get categoryLabel(): string {
    return this.statusData.categoryLabel ?? '';
  }

  get violationDetailText(): string {
    const evidence = this.args.finding.evidence;

    return isEmpty(evidence) ? '—' : evidence;
  }

  get remediationSteps(): string[] {
    return this.args.finding.remediationSteps ?? [];
  }

  get explanationRows(): { label: string; value: string }[] {
    const finding = this.args.finding;

    return [
      {
        label: this.intl.t('storeReleaseReadiness.explanationSource'),
        value: finding.source,
      },
      {
        label: this.intl.t('storeReleaseReadiness.explanationFieldChecked'),
        value: finding.fieldChecked,
      },
      {
        label: this.intl.t('storeReleaseReadiness.explanationExpected'),
        value: finding.expected,
      },
      {
        label: this.intl.t('storeReleaseReadiness.explanationActualFound'),
        value: finding.evidence,
      },
      {
        label: this.intl.t('storeReleaseReadiness.explanation'),
        value: finding.explanation,
      },
    ];
  }

  @action
  openIgnoredDrawer(): void {
    this.showIgnoredDrawer = true;
  }

  @action
  closeIgnoredDrawer(): void {
    this.showIgnoredDrawer = false;
  }

  @action
  openConfirmationDrawer(): void {
    this.showConfirmationDrawer = true;
  }

  @action
  closeConfirmationDrawer(): void {
    this.showConfirmationDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::PolicyDetails': typeof StoreReleaseReadinessPolicyDetailsComponent;
  }
}

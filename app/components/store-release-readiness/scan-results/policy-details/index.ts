import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';
import type { AssessmentPolicyRow } from '..';
import type { StoreReleaseReadinessCardData } from '../../release-card';

import './index.scss';

export interface StoreReleaseReadinessScanResultsPolicyDetailsSignature {
  Args: {
    item: StoreReleaseReadinessCardData;
    policy?: AssessmentPolicyRow;
    finding: StoreReleaseReadinessFindingModel;
  };
}

export default class StoreReleaseReadinessScanResultsPolicyDetailsComponent extends Component<StoreReleaseReadinessScanResultsPolicyDetailsSignature> {
  @service declare intl: IntlService;
  @tracked showIgnoredDrawer = false;
  @tracked showConfirmationDrawer = false;

  get showFailedEditChip(): boolean {
    return this.statusData.status === 'failed';
  }

  get showOverrideDescriptionChip(): boolean {
    return this.statusData.isOverridden === true;
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

  get statusData(): AssessmentPolicyRow {
    const p = this.args.policy;
    const f = this.args.finding;

    if (p) {
      return {
        ...p,
        severity: p.severity ?? f.severity,
        isOverridden: p.isOverridden ?? f.isOverridden,
      };
    }

    return {
      id: String(f.id),
      categoryLabel: f.category,
      titleLabel: f.title,
      status:
        f.passed === false
          ? 'failed'
          : f.passed === true
            ? 'passed'
            : 'untested',
      severity: f.severity,
      isOverridden: f.isOverridden,
    };
  }

  get titleLabel(): string {
    const p = this.statusData;

    if (p.titleLabel != null && p.titleLabel !== '') {
      return p.titleLabel;
    }

    return this.intl.t(`storeReleaseReadinessModule.${p.titleKey as string}`);
  }

  get categoryLabel(): string {
    const p = this.statusData;

    if (p.categoryLabel != null && p.categoryLabel !== '') {
      return p.categoryLabel;
    }

    return this.intl.t(
      `storeReleaseReadinessModule.${p.categoryKey as string}`
    );
  }

  get violationDetailText(): string {
    const v = this.args.finding.evidence;

    return v != null && v !== '' ? v : '—';
  }

  get remediationSteps(): string[] {
    return this.args.finding.remediationSteps ?? [];
  }

  get explanationRows(): { label: string; value: string }[] {
    const p = 'storeReleaseReadinessModule';
    const f = this.args.finding;
    const actualFoundLabel = this.intl.t(
      `${p}.policyDetailExplanationActualFound`
    );

    return [
      {
        label: this.intl.t(`${p}.policyDetailExplanationSource`),
        value: this.explanationCell(f.source),
      },
      {
        label: this.intl.t(`${p}.policyDetailExplanationFieldChecked`),
        value: this.explanationCell(f.fieldChecked),
      },
      {
        label: this.intl.t(`${p}.policyDetailExplanationExpected`),
        value: this.explanationCell(f.expected),
      },
      {
        label: actualFoundLabel,
        value: this.explanationCell(f.evidence),
      },
      {
        label: actualFoundLabel,
        value: this.explanationCell(f.explanation),
      },
    ];
  }

  private explanationCell(value: string | undefined | null): string {
    const t = value?.trim();

    return t !== undefined && t !== '' ? t : '—';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::PolicyDetails': typeof StoreReleaseReadinessScanResultsPolicyDetailsComponent;
  }
}

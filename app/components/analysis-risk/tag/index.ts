import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export interface AnalysisRiskTagSignature {
  Element: HTMLElement;
  Args: {
    computedRisk: number;
    originalRisk?: number | null;
    overriddenRisk?: number | null;
    isOverridden?: boolean;
    disableOverriddenTooltip?: boolean;
    isPending?: boolean;
    pendingRequestedRisk?: number | null;
    status?: number;
    isCapsule?: boolean;
  };
}

export default class AnalysisRiskTagComponent extends Component<AnalysisRiskTagSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;

  get memberOverrideRequestFeature() {
    return this.organization.selected?.features?.member_override_request;
  }

  get showPendingApprovalIcon() {
    if (!this.args.isPending || this.args.isOverridden) {
      return false;
    }

    return Boolean(this.me.org?.is_member && this.memberOverrideRequestFeature);
  }

  get analysisRiskStatus() {
    return analysisRiskStatus([
      this.args.computedRisk,
      this.args.status ?? ENUMS.ANALYSIS.COMPLETED,
      Boolean(this.args.isOverridden),
    ]);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::Tag': typeof AnalysisRiskTagComponent;
  }
}

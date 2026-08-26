import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';
import parseError from 'irene/utils/parse-error';
import type { AkIconVariantType } from 'ak-icons';
import type { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';
import type { ActiveContentComponent } from '../content';

type AuditChip = {
  label: string;
  icon: AkIconVariantType | null;
  value: string;
  renderRiskChange: boolean;
};

export interface AnalysisRiskOverrideEditDrawerPendingRequestDetailsSignature {
  Args: {
    dataModel: AnalysisRiskDataModel;
    setAppBarData: (appBarData: OverrideEditDrawerAppBarData) => void;
    setActiveComponent: (component: ActiveContentComponent) => void;
    drawerCloseHandler: () => void;
  };
}

export default class AnalysisRiskOverrideEditDrawerPendingRequestDetailsComponent extends Component<AnalysisRiskOverrideEditDrawerPendingRequestDetailsSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  constructor(
    owner: unknown,
    args: AnalysisRiskOverrideEditDrawerPendingRequestDetailsSignature['Args']
  ) {
    super(owner, args);

    const title = this.isApprovalView
      ? this.intl.t('approvalRequest')
      : this.intl.t('overrideDetails');

    this.args.setAppBarData({ title });
  }

  get isApprovalView() {
    return Boolean(this.args.dataModel.approveOverrideHandler);
  }

  get pendingRequest() {
    return this.args.dataModel.pendingOverrideRequest;
  }

  get requestedRiskLabel() {
    const risk = this.pendingRequest?.requestedStatus;

    if (risk === undefined || risk === null) {
      return '';
    }

    return this.intl.t(riskText([risk]) as string);
  }

  get overrideCriteriaLabel() {
    switch (this.pendingRequest?.analysisOverrideCriteria) {
      case ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE:
        return this.intl.t('currentFileOnly');

      case ENUMS.ANALYSIS_OVERRIDE_CRITERIA.ALL_FUTURE_UPLOAD:
        return this.intl.t('allFutureAnalyses');

      default:
        return '';
    }
  }

  get auditChips(): AuditChip[] {
    if (!this.pendingRequest) {
      return [];
    }

    const changeLabel = this.isApprovalView
      ? this.intl.t('editAnalysisRequest.requestedSeverity')
      : this.intl.t('editAnalysisRequest.requestedChange');

    return [
      {
        icon: 'event',
        label: this.intl.t('requestedOn'),
        value: dayjs(this.pendingRequest.createdOn).format('MMM DD, YYYY'),
        renderRiskChange: false,
      },
      {
        icon: 'account-circle',
        label: this.intl.t('editAnalysisRequest.requestedBy'),
        value: this.pendingRequest.requestedBy?.username ?? '',
        renderRiskChange: false,
      },
      {
        icon: null,
        label: changeLabel,
        value: '',
        renderRiskChange: true,
      },
    ];
  }

  @action
  handleRejectClick() {
    this.args.setActiveComponent(
      'analysis-risk/override-edit-drawer/reject-confirm'
    );
  }

  @action
  handleApproveClick() {
    this.approveTask.perform();
  }

  @action
  setActiveComponentToOverrideDetails() {
    this.args.setActiveComponent(
      'analysis-risk/override-edit-drawer/override-details'
    );
  }

  approveTask = task(async () => {
    try {
      await this.args.dataModel.approveOverrideHandler?.(
        this.setActiveComponentToOverrideDetails
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::PendingRequestDetails': typeof AnalysisRiskOverrideEditDrawerPendingRequestDetailsComponent;
    'analysis-risk/override-edit-drawer/pending-request-details': typeof AnalysisRiskOverrideEditDrawerPendingRequestDetailsComponent;
  }
}

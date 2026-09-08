import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';

export interface AnalysisRiskOverrideEditDrawerContentSignature {
  Args: {
    dataModel: AnalysisRiskDataModel;
    setAppBarData: (appBarData: OverrideEditDrawerAppBarData) => void;
    drawerCloseHandler: () => void;
  };
}

export type ActiveContentComponent =
  | 'analysis-risk/override-edit-drawer/override-details'
  | 'analysis-risk/override-edit-drawer/override-form'
  | 'analysis-risk/override-edit-drawer/reset-confirm'
  | 'analysis-risk/override-edit-drawer/reject-confirm'
  | 'analysis-risk/override-edit-drawer/pending-request-details';

export default class AnalysisRiskOverrideEditDrawerContentComponent extends Component<AnalysisRiskOverrideEditDrawerContentSignature> {
  @tracked showOverrideFormToEdit = false;
  @tracked activeComponent: ActiveContentComponent;

  constructor(
    owner: unknown,
    args: AnalysisRiskOverrideEditDrawerContentSignature['Args']
  ) {
    super(owner, args);

    this.activeComponent = this.overrideRequestIsPending
      ? 'analysis-risk/override-edit-drawer/pending-request-details'
      : this.getDefaultOverrideComponent();
  }

  get overrideRequestIsPending() {
    return this.pendingOverrideRequest?.isPending;
  }

  get isApprovalView() {
    return Boolean(this.args.dataModel.approveOverrideHandler);
  }

  get pendingOverrideRequest() {
    return this.args.dataModel.pendingOverrideRequest;
  }

  get showPendingOverrideRequestConfirmBanner() {
    return (
      this.pendingOverrideRequest &&
      this.pendingOverrideRequest.isPending &&
      !this.isApprovalView
    );
  }

  @action
  handleShowOverrideFormToEdit(value: boolean) {
    this.showOverrideFormToEdit = value;
  }

  @action
  setActiveComponent(component: ActiveContentComponent) {
    this.activeComponent = component;
  }

  getDefaultOverrideComponent() {
    return this.args.dataModel.isOverridden
      ? 'analysis-risk/override-edit-drawer/override-details'
      : 'analysis-risk/override-edit-drawer/override-form';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::Content': typeof AnalysisRiskOverrideEditDrawerContentComponent;
  }
}

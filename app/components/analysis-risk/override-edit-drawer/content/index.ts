import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';

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
  | 'analysis-risk/override-edit-drawer/reset-confirm';

export default class AnalysisRiskOverrideEditDrawerContentComponent extends Component<AnalysisRiskOverrideEditDrawerContentSignature> {
  @tracked showOverrideFormToEdit = false;
  @tracked activeComponent: ActiveContentComponent;

  constructor(
    owner: unknown,
    args: AnalysisRiskOverrideEditDrawerContentSignature['Args']
  ) {
    super(owner, args);

    this.activeComponent = this.args.dataModel.isOverridden
      ? 'analysis-risk/override-edit-drawer/override-details'
      : 'analysis-risk/override-edit-drawer/override-form';
  }

  @action
  handleShowOverrideFormToEdit(value: boolean) {
    this.showOverrideFormToEdit = value;
  }

  @action
  setActiveComponent(component: ActiveContentComponent) {
    this.activeComponent = component;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::Content': typeof AnalysisRiskOverrideEditDrawerContentComponent;
  }
}

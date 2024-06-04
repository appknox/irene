import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';
import { ActiveContentComponent } from '../content';
import { task } from 'ember-concurrency';

export interface AnalysisRiskOverrideEditDrawerResetConfirmSignature {
  Args: {
    dataModel: AnalysisRiskDataModel;
    setAppBarData: (appBarData: OverrideEditDrawerAppBarData) => void;
    setActiveComponent: (component: ActiveContentComponent) => void;
  };
}

export default class AnalysisRiskOverrideEditDrawerResetConfirmComponent extends Component<AnalysisRiskOverrideEditDrawerResetConfirmSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showResetSuccess = false;

  constructor(
    owner: unknown,
    args: AnalysisRiskOverrideEditDrawerResetConfirmSignature['Args']
  ) {
    super(owner, args);

    this.args.setAppBarData({
      title: this.intl.t('confirmation'),
      onBackClick: this.handleResetCancel,
    });
  }

  get dataModel() {
    return this.args.dataModel || null;
  }

  @action
  handleReset(all?: boolean) {
    this.resetHandlerTask.perform(Boolean(all));
  }

  @action
  handleResetCancel() {
    this.args.setActiveComponent(
      'analysis-risk/override-edit-drawer/override-details'
    );
  }

  resetHandlerTask = task(async (all: boolean) => {
    try {
      await this.dataModel.resetOverrideHandler(all);

      if (!this.isDestroyed) {
        this.showResetSuccess = true;

        this.args.setAppBarData({ title: this.intl.t('successMessage') });
      }
    } catch (error) {
      this.notify.error((error as AdapterError).payload.message);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::ResetConfirm': typeof AnalysisRiskOverrideEditDrawerResetConfirmComponent;
    'analysis-risk/override-edit-drawer/reset-confirm': typeof AnalysisRiskOverrideEditDrawerResetConfirmComponent;
  }
}

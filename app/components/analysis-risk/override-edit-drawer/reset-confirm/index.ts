import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

import type IntlService from 'ember-intl/services/intl';
import type { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';
import type { ActiveContentComponent } from '../content';
import type AnalysisModel from 'irene/models/analysis';

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
    // Prevent resetting overrides for deprecated/inactive vulnerabilities
    const vulnerability = (this.dataModel.model as AnalysisModel)?.get?.(
      'vulnerability'
    );

    if (vulnerability?.get?.('isActive') === false) {
      this.notify.error(this.intl.t('vulnerabilityDeprecatedReadonly'));

      return;
    }

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

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';
import type { ActiveContentComponent } from '../content';

export interface AnalysisRiskOverrideEditDrawerRejectConfirmSignature {
  Args: {
    dataModel: AnalysisRiskDataModel;
    setAppBarData: (appBarData: OverrideEditDrawerAppBarData) => void;
    setActiveComponent: (component: ActiveContentComponent) => void;
    drawerCloseHandler: () => void;
  };
}

export default class AnalysisRiskOverrideEditDrawerRejectConfirmComponent extends Component<AnalysisRiskOverrideEditDrawerRejectConfirmSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showRejectSuccess = false;

  constructor(
    owner: unknown,
    args: AnalysisRiskOverrideEditDrawerRejectConfirmSignature['Args']
  ) {
    super(owner, args);

    this.args.setAppBarData({
      title: this.intl.t('confirmation'),
      onBackClick: this.handleRejectCancel,
    });
  }

  @action
  handleRejectCancel() {
    this.args.setActiveComponent(
      'analysis-risk/override-edit-drawer/pending-request-details'
    );
  }

  @action
  handleReject(reason: string) {
    this.rejectHandlerTask.perform(reason);
  }

  getFieldErrorMessage(err: AdapterError) {
    const error = err?.errors?.length ? err.errors[0] : err;

    const dsError = error as {
      detail?: string;
      source?: { pointer?: string };
    };

    if (dsError?.detail && dsError?.source?.pointer) {
      const fieldName = dsError.source.pointer.split('/').pop();

      return fieldName ? `"${fieldName}" - ${dsError.detail}` : dsError.detail;
    }

    const payload = (error as AdapterError)?.payload;

    if (
      !payload ||
      typeof payload !== 'object' ||
      payload.detail ||
      payload.message
    ) {
      return null;
    }

    const [firstKey] = Object.keys(payload);
    const fieldMessages = firstKey ? payload[firstKey] : null;

    const message = Array.isArray(fieldMessages)
      ? fieldMessages[0]
      : fieldMessages;

    return firstKey && message ? `"${firstKey}" - ${message}` : message;
  }

  rejectHandlerTask = task(async (reason: string) => {
    try {
      await this.args.dataModel.rejectOverrideHandler?.(reason);

      if (!this.isDestroyed) {
        this.showRejectSuccess = true;
        this.args.setAppBarData({ title: this.intl.t('successMessage') });
      }
    } catch (error) {
      const errorMessage =
        this.getFieldErrorMessage(error as AdapterError) ||
        parseError(error, this.intl.t('pleaseTryAgain'));

      this.notify.error(errorMessage);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::RejectConfirm': typeof AnalysisRiskOverrideEditDrawerRejectConfirmComponent;
    'analysis-risk/override-edit-drawer/reject-confirm': typeof AnalysisRiskOverrideEditDrawerRejectConfirmComponent;
  }
}

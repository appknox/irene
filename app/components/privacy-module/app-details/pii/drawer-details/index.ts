import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type PiiModel from 'irene/models/pii';

export interface PrivacyModuleAppDetailsPiiDrawerDetailsComponentSignature {
  Args: {
    selectedPii: PiiModel | null;
  };
}

type SourceType = 'BINARY' | 'API';

export default class PrivacyModuleAppDetailsPiiDrawerDetailsComponent extends Component<PrivacyModuleAppDetailsPiiDrawerDetailsComponentSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  get selectedPii() {
    return this.args.selectedPii;
  }

  get selectedPiiData() {
    return this.selectedPii?.piiData?.[0];
  }

  get multiplePiiDataLength() {
    return this.selectedPii?.piiData?.length ?? 0;
  }

  get multiplePiiData() {
    return this.multiplePiiDataLength > 1;
  }

  @action
  getSource(source?: SourceType) {
    if (source === 'BINARY') {
      return this.intl.t('appBinary');
    }

    return this.intl.t('api');
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('urlCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.intl.t('somethingWentWrong'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Pii::DrawerDetails': typeof PrivacyModuleAppDetailsPiiDrawerDetailsComponent;
  }
}

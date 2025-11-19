import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import type PrivacyModuleService from 'irene/services/privacy-module';
import type { AkNotificationBannerMessage } from 'irene/components/ak-notification-banner';

export default class PrivacyModuleAppDetailsNoteComponent extends Component {
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;

  get showCompleteApiScanNote() {
    return this.privacyModule.showCompleteApiScanNote;
  }

  get showPiiUpdated() {
    return this.privacyModule.showPiiUpdated;
  }

  get showGeoUpdated() {
    return this.privacyModule.showGeoUpdated;
  }

  get showNote() {
    return this.privacyModule.showNote;
  }

  get showCompleteDastScanNote() {
    return this.privacyModule.showCompleteDastScanNote;
  }

  get messages() {
    const list: AkNotificationBannerMessage[] = [];

    if (this.showCompleteApiScanNote) {
      list.push({
        icon: 'warning',
        color: 'warning-color',
        message: this.intl.t('privacyModule.completeApiScanNote'),
      });
    }

    if (this.showCompleteDastScanNote) {
      list.push({
        icon: 'warning',
        color: 'warning-color',
        message: this.intl.t('privacyModule.completeDastScanNote'),
      });
    }

    if (this.showPiiUpdated) {
      list.push({
        icon: 'check-circle',
        color: 'success-color',
        message: this.intl.t('privacyModule.piiUpdatedNote'),
      });
    }

    if (this.showGeoUpdated) {
      list.push({
        icon: 'check-circle',
        color: 'success-color',
        message: this.intl.t('privacyModule.geoUpdatedNote'),
      });
    }

    return list;
  }

  @action
  closeBanner() {
    this.privacyModule.showNote = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Note': typeof PrivacyModuleAppDetailsNoteComponent;
  }
}

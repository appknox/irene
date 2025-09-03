import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import type PrivacyModuleService from 'irene/services/privacy-module';

export default class PrivacyModuleAppDetailsNoteComponent extends Component {
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;

  get showCompleteApiScanNote() {
    return this.privacyModule.showCompleteApiScanNote;
  }

  get showPiiUpdated() {
    return this.privacyModule.showPiiUpdated;
  }

  get showPiiUpdatedNote() {
    return this.privacyModule.showPiiUpdatedNote;
  }

  get banner() {
    if (this.showCompleteApiScanNote) {
      return {
        icon: 'warning' as const,
        color: 'warning-color',
        message: this.intl.t('privacyModule.completeApiScanNote'),
        onClose: this.closeCompleteApiNote,
      };
    }

    if (this.showPiiUpdated && this.showPiiUpdatedNote) {
      return {
        icon: 'check-circle' as const,
        color: 'success-color',
        message: this.intl.t('privacyModule.piiUpdatedNote'),
        onClose: this.closePiiUpdatedNote,
      };
    }

    return null;
  }

  @action
  closeCompleteApiNote() {
    this.privacyModule.showCompleteApiScanNote = false;
  }

  @action
  closePiiUpdatedNote() {
    this.privacyModule.showPiiUpdatedNote = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Note': typeof PrivacyModuleAppDetailsNoteComponent;
  }
}

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import ClipboardJS from 'clipboard/src/clipboard';

import PersonaltokenModel from 'irene/models/personaltoken';

export interface AccountSettingsDeveloperSettingsPersonaltokenListCopyTokenSignature {
  Args: {
    personalToken: PersonaltokenModel;
  };
}

export default class AccountSettingsDeveloperSettingsPersonaltokenListCopyTokenComponent extends Component<AccountSettingsDeveloperSettingsPersonaltokenListCopyTokenSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('tokenCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.intl.t('pleaseTryAgain'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'account-settings/developer-settings/personal-token-list/copy-token': typeof AccountSettingsDeveloperSettingsPersonaltokenListCopyTokenComponent;
  }
}

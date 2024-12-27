import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import ENV from 'irene/config/environment';

import PersonaltokenModel from 'irene/models/personaltoken';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

export interface AccountSettingsDeveloperSettingsPersonaltokenListDeleteTokenSignature {
  Args: {
    personalToken: PersonaltokenModel;
    reloadTokens: () => Promise<void>;
  };
}

export default class AccountSettingsDeveloperSettingsPersonaltokenListDeleteTokenComponent extends Component<AccountSettingsDeveloperSettingsPersonaltokenListDeleteTokenSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;

  @tracked showRevokePersonalTokenConfirmBox = false;

  @action
  openRevokePersonalTokenConfirmBox() {
    this.showRevokePersonalTokenConfirmBox = true;
  }

  @action
  closeRevokePersonalTokenConfirmBox() {
    this.showRevokePersonalTokenConfirmBox = false;
  }

  revokePersonalToken = task(async () => {
    const tTokenRevoked = this.intl.t('personalTokenRevoked');
    const personaltokenId = this.args.personalToken.id;

    const url = [ENV.endpoints['personaltokens'], personaltokenId].join('/');

    try {
      await this.ajax.delete(url);

      if (!this.isDestroyed) {
        await this.args.reloadTokens();

        this.closeRevokePersonalTokenConfirmBox();
      }

      this.notify.success(tTokenRevoked);
    } catch (error) {
      if (!this.isDestroyed) {
        this.notify.error((error as AjaxError).payload.message);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'account-settings/developer-settings/personal-token-list/delete-token': typeof AccountSettingsDeveloperSettingsPersonaltokenListDeleteTokenComponent;
  }
}

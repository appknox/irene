import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import ENV from 'irene/config/environment';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { query } from 'ember-data-resources';

import PersonaltokenModel from 'irene/models/personaltoken';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

export default class AccountSettingsDeveloperSettingsPersonaltokenListComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked tokenName = '';
  @tracked showGenerateTokenModal = false;

  @tracked personalTokens = query<PersonaltokenModel>(
    this,
    'personaltoken',
    () => ({ limit: 10, offset: 0 })
  );

  get personalTokenList() {
    return this.personalTokens.records?.slice() || [];
  }

  get hasPersonalTokens() {
    return this.personalTokenList.length > 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        valuePath: 'name',
        width: 150,
      },
      {
        name: this.intl.t('created'),
        valuePath: 'createdDateOnHumanized',
        width: 120,
      },
      {
        name: this.intl.t('personalTokenKey'),
        valuePath: 'key',
        width: 350,
      },
      {
        name: this.intl.t('copy'),
        component:
          'account-settings/developer-settings/personal-token-list/copy-token',
        textAlign: 'center',
      },
      {
        name: this.intl.t('delete'),
        component:
          'account-settings/developer-settings/personal-token-list/delete-token',
        textAlign: 'center',
      },
    ];
  }

  generateToken = task(async () => {
    const tTokenCreated = this.intl.t('personalTokenGenerated');
    const tEnterTokenName = this.intl.t('enterTokenName');

    if (isEmpty(this.tokenName.trim())) {
      return this.notify.error(tEnterTokenName);
    }

    try {
      const data = {
        name: this.tokenName,
      };

      await this.ajax.post(ENV.endpoints['personaltokens'] as string, {
        data,
      });

      if (!this.isDestroyed) {
        await this.personalTokens.retry();

        this.tokenName = '';
      }

      this.notify.success(tTokenCreated);
    } catch (error) {
      if (!this.isDestroyed) {
        this.notify.error((error as AjaxError).payload.message);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::DeveloperSettings::PersonalTokenList': typeof AccountSettingsDeveloperSettingsPersonaltokenListComponent;
  }
}

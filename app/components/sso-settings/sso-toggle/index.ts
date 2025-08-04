import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationSsoModel from 'irene/models/organization-sso';

export interface SsoSettingsSsoToggleSignature {
  Args: {
    organization: OrganizationModel;
    user: UserModel;
  };
}

export default class SsoSettingsSsoToggleComponent extends Component<SsoSettingsSsoToggleSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked sso: OrganizationSsoModel | null = null;

  tPleaseTryAgain: string;

  constructor(owner: unknown, args: SsoSettingsSsoToggleSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.getSSOData.perform();
  }

  getSSOData = task(async () => {
    try {
      this.sso = await this.store.queryRecord('organization-sso', {});

      if (!this.sso) {
        this.notify.error('SSO data not found');
        return;
      }
    } catch (e) {
      this.notify.error(parseError(e, 'Failed to fetch SSO data'));
    }
  });

  // Enable SSO
  toggleSSOEnable = task({ restartable: true }, async (event, value) => {
    if (!this.sso) {
      this.notify.error('SSO data not found');
      return;
    }

    try {
      this.sso.set('enabled', value);
      await this.sso.save();

      this.notify.success(
        `SSO authentication ${value ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  // Enforce SSO
  toggleSSOEnforce = task({ restartable: true }, async (event, value) => {
    if (!this.sso) {
      this.notify.error('SSO data not loaded');
      return;
    }

    try {
      this.sso.set('enforced', value);
      await this.sso.save();

      this.notify.success(`SSO enforce turned ${value ? 'ON' : 'OFF'}`);
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::SsoToggle': typeof SsoSettingsSsoToggleComponent;
  }
}

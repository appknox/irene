import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
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
        this.notify.error(this.intl.t('ssoNotFound'));

        return;
      }
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('ssoNotFound')));
    }
  });

  // Enable SSO
  toggleSSOEnable = task(
    { restartable: true },
    async (event: Event, value: boolean) => {
      if (!this.sso) {
        this.notify.error(this.intl.t('ssoNotFound'));

        return;
      }

      try {
        this.sso.set('enabled', value);
        await this.sso.save();

        this.notify.success(
          `${this.intl.t('ssoAuthentication')} ${value ? this.intl.t('enabled') : this.intl.t('disabled')}`
        );
      } catch (err) {
        // revert change if failed
        this.sso.rollbackAttributes();

        this.notify.error(parseError(err, this.tPleaseTryAgain));
      }
    }
  );

  // Enforce SSO
  toggleSSOEnforce = task(
    { restartable: true },
    async (event: Event, value: boolean) => {
      if (!this.sso) {
        this.notify.error(this.intl.t('ssoNotFound'));

        return;
      }

      try {
        this.sso.set('enforced', value);
        await this.sso.save();

        this.notify.success(
          `${this.intl.t('ssoEnforceTurned')} ${value ? this.intl.t('on') : this.intl.t('off')}`
        );
      } catch (err) {
        // revert change if failed
        this.sso.rollbackAttributes();

        this.notify.error(parseError(err, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::SsoToggle': typeof SsoSettingsSsoToggleComponent;
  }
}

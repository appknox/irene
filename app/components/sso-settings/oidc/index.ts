import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import {
  validateFormat,
  validatePresence,
} from 'ember-changeset-validations/validators';
import type { BufferedChangeset } from 'ember-changeset/types';

import { action } from '@ember/object';
import { Changeset } from 'ember-changeset';
import { waitForPromise } from '@ember/test-waiters';
import lookupValidator from 'ember-changeset-validations';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type OidcProviderModel from 'irene/models/oidc-provider';
import type OrganizationSsoModel from 'irene/models/organization-sso';
import type AnalyticsService from 'irene/services/analytics';

type OIDCChangeset = {
  client_id: string;
  client_secret: string;
  discovery_url: string;
} & BufferedChangeset;

const OIDCValidations = {
  client_id: [validatePresence(true)],
  client_secret: [validatePresence(true)],
  discovery_url: [
    validatePresence(true),
    validateFormat({ type: 'url', allowBlank: true }),
  ],
};

export interface SsoSettingsOidcSignature {
  Args: {
    organization: OrganizationModel;
    user: UserModel;
    sso: OrganizationSsoModel | null;
    providers: OidcProviderModel;
    deleteProvider: () => void;
    refreshSsoData: () => void;
  };
}

export default class SsoSettingsOidcComponent extends Component<SsoSettingsOidcSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service declare analytics: AnalyticsService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  @tracked changeset: OIDCChangeset | null = null;
  @tracked showDeleteOidcConfirm = false;

  tPleaseTryAgain: string;
  tRemovedSSOSuccessfully: string;

  constructor(owner: unknown, args: SsoSettingsOidcSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tRemovedSSOSuccessfully = this.intl.t('removedSSOSuccessfully');

    this.changeset = Changeset(
      {
        client_id: '',
        client_secret: '',
        discovery_url: '',
      },
      lookupValidator(OIDCValidations),
      OIDCValidations
    ) as OIDCChangeset;
  }

  get hasProviders() {
    return this.args.providers;
  }

  get discoveryUrl() {
    return this.args.providers?.get('discoveryUrl') || '';
  }

  get redirectUrl() {
    const origin = this.window.location.origin;
    const redirectURL = `${origin}/sso/oidc/redirect`;

    return redirectURL;
  }

  @action
  resetForm() {
    if (this.changeset) {
      this.changeset.rollback();
    }
  }

  @action
  openDeleteOidcConfirm() {
    this.showDeleteOidcConfirm = true;
  }

  createProvider = task({ drop: true }, async () => {
    await this.changeset?.validate();

    if (!this.changeset?.isValid) {
      this.notify.error(this.intl.t('pleaseCheckForm'));

      return;
    }

    const data = {
      clientId: this.changeset.client_id,
      clientSecret: this.changeset.client_secret,
      discoveryUrl: this.changeset.discovery_url,
    };

    try {
      const provider = this.store.createRecord('oidc-provider', data);

      await waitForPromise(provider.save());

      this.notify.success(this.intl.t('ssoSettings.oidc.successMessage'));
      this.args.refreshSsoData();
      this.changeset.rollback();

      this.analytics.track({
        name: 'SSO_OIDC_EVENT',
        properties: {
          feature: 'oidc_sso_provider_created',
        },
      });
    } catch (err) {
      const error = err as AdapterError;

      this.notify.error(
        error?.errors?.[0]?.detail || this.intl.t('somethingWentWrong')
      );
    }
  });

  deleteProvider = task({ drop: true }, async () => {
    const provider = this.args.providers;

    if (!provider) {
      this.notify.error(this.intl.t('noProviderFound'));
      this.showDeleteOidcConfirm = false;

      return;
    }

    try {
      await waitForPromise(provider.destroyRecord());
      this.args.refreshSsoData();
      this.args.deleteProvider();
      this.notify.success(this.tRemovedSSOSuccessfully);
      this.showDeleteOidcConfirm = false;

      this.analytics.track({
        name: 'SSO_OIDC_EVENT',
        properties: {
          feature: 'oidc_sso_provider_deleted',
        },
      });
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('somethingWentWrong')));
      this.showDeleteOidcConfirm = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::Oidc': typeof SsoSettingsOidcComponent;
    'sso-settings/oidc': typeof SsoSettingsOidcComponent;
  }
}

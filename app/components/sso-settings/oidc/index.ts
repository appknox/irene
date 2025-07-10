/* eslint-disable ember/no-jquery */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import { BufferedChangeset } from 'ember-changeset/types';
import { validatePresence } from 'ember-changeset-validations/validators';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';

import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import OidcProviderModel from 'irene/models/oidc-provider';
import { waitForPromise } from '@ember/test-waiters';

type OIDCChangeset = {
  client_id: string;
  client_secret: string;
  discovery_url: string;
} & BufferedChangeset;

const OIDCValidations = {
  client_id: [validatePresence(true)],
  client_secret: [validatePresence(true)],
  discovery_url: [validatePresence(true)],
};

export interface SsoSettingsOidcSignature {
  Args: {
    organization: OrganizationModel;
    user: UserModel;
  };
}

export default class SsoSettingsOidcComponent extends Component<SsoSettingsOidcSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked providers: OidcProviderModel[] = [];
  @tracked changeset: OIDCChangeset | null = null;

  tPleaseTryAgain: string;
  tSomethingWentWrongContactSupport: string;
  tRemovedSSOSuccessfully: string;

  constructor(owner: unknown, args: SsoSettingsOidcSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tSomethingWentWrongContactSupport = this.intl.t(
      'somethingWentWrongContactSupport'
    );
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

    this.loadProviders.perform();
  }

  loadProviders = task({ restartable: true }, async () => {
    try {
      const providers = await this.store.findAll('oidc-provider');
      this.providers = providers.toArray();
    } catch (err) {
      this.notify.error(parseError(err, 'Failed to load providers'));
    }
  });

  createProvider = task({ drop: true }, async () => {
    await this.changeset?.validate();

    if (!this.changeset?.isValid) {
      this.notify.error(this.intl.t('validationErrors'));
      return;
    }

    const data = {
      clientId: this.changeset.client_id,
      clientSecret: this.changeset.client_secret,
      discoveryUrl: this.changeset.discovery_url,
    };

    console.log(data);

    try {
      // await this.store.createRecord('oidc-provider', data).save();

      const abc = this.store.createRecord('oidc-provider', data);

      await waitForPromise(abc.save());

      this.notify.success(this.intl.t('oidcProviderCreated'));
      this.changeset.rollback(); // clear form
    } catch (error) {
      this.notify.error(this.intl.t('tSomethingWentWrong'));
      // optionally add detailed errors to changeset
    }
  });

  deleteProvider = task({ drop: true }, async () => {
    const provider = this.providers[0];

    if (!provider) {
      this.notify.error(this.intl.t('noProviderFound'));
      return;
    }

    try {
      await waitForPromise(provider.destroyRecord());
      this.notify.success(this.tRemovedSSOSuccessfully);
      this.loadProviders.perform(); // refresh list
    } catch (error) {
      this.notify.error(
        parseError(error, this.tSomethingWentWrongContactSupport)
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::Oidc': typeof SsoSettingsOidcComponent;
    'sso-settings/oidc': typeof SsoSettingsOidcComponent;
  }
}

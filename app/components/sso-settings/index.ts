/* eslint-disable ember/no-jquery */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';
import type Saml2IdPMetadataModel from 'irene/models/saml2-idp-metadata';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationSsoModel from 'irene/models/organization-sso';
import type OidcProviderModel from 'irene/models/oidc-provider';

interface SpMetadata {
  entity_id: string;
  acs_url: string;
  named_id_format: string;
  metadata: string;
}

export interface SsoSettingsSignature {
  Args: {
    organization: OrganizationModel;
    user: UserModel;
  };
}

export default class SsoSettingsComponent extends Component<SsoSettingsSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showDeleteIdpMetadataConfirm = false;
  @tracked spMetadata: SpMetadata | null = null;
  @tracked idpMetadata: Saml2IdPMetadataModel | null = null;
  @tracked idpMetadataXml: string | null = null;
  @tracked spConfig: string = 'manual';
  @tracked sso: OrganizationSsoModel | null = null;
  @tracked providers: OidcProviderModel[] = [];

  @tracked activeTab: number | null = null;

  spMetadataKeys = [
    { labelKey: 'entityID', valueKey: 'entity_id' },
    { labelKey: 'acsURL', valueKey: 'acs_url' },
    { labelKey: 'nameIDFormat', valueKey: 'named_id_format' },
  ];

  tPleaseTryAgain: string;
  tSomethingWentWrongContactSupport: string;
  tRemovedSSOSuccessfully: string;

  constructor(owner: unknown, args: SsoSettingsSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tSomethingWentWrongContactSupport = this.intl.t(
      'somethingWentWrongContactSupport'
    );
    this.tRemovedSSOSuccessfully = this.intl.t('removedSSOSuccessfully');

    this.setDefaultTab.perform();
    this.getSSOData.perform();
  }

  get tabItems() {
    return [
      {
        id: 1,
        label: 'SAML Authentication',
        component: 'sso-settings/saml' as const,
      },
      {
        id: 2,
        label: 'OIDC',
        component: 'sso-settings/oidc' as const,
      },
    ];
  }

  get activeTabComponent() {
    return this.tabItems.find((t) => t.id === this.activeTab)?.component;
  }

  get hasSamlOrOidc() {
    return this.idpMetadata || (this.providers && this.providers.length > 0);
  }

  @action
  onTabClick(tabId: number) {
    this.activeTab = tabId;
  }

  setDefaultTab = task(async () => {
    await this.getIdPMetadata.perform();
    await this.loadProviders.perform();

    if (this.providers?.length) {
      this.activeTab = 2; // OIDC tab
    } else if (this.idpMetadata) {
      this.activeTab = 1; // SAML tab
    } else {
      this.activeTab = 1;
    }
  });

  // Fetch IdP Metadata
  getIdPMetadata = task({ restartable: true }, async () => {
    try {
      const idpMetadata = await this.store.queryRecord(
        'saml2-idp-metadata',
        {}
      );

      this.idpMetadata = idpMetadata;
    } catch (error) {
      // catch error
    }
  });

  loadProviders = task({ restartable: true }, async () => {
    try {
      const providers = await this.store.findAll('oidc-provider');
      this.providers = providers.toArray();
    } catch (err) {
      this.notify.error(parseError(err, 'Failed to load providers'));
    }
  });

  getSSOData = task(async () => {
    try {
      this.sso = await this.store.queryRecord('organization-sso', {});
    } catch (e) {
      this.notify.error(parseError(e));
    }
  });

  // Enable SSO
  toggleSSOEnable = task({ restartable: true }, async (event, value) => {
    try {
      const ssoObj = this.store.peekRecord(
        'organization-sso',
        this.args.organization.id
      );
      ssoObj?.set('enabled', value);

      await ssoObj?.save();

      this.notify.success(
        `SSO authentication ${value ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  // Enforce SSO
  toggleSSOEnforce = task({ restartable: true }, async (event, value) => {
    try {
      const ssoObj = this.store.peekRecord(
        'organization-sso',
        this.args.organization.id
      );
      ssoObj?.set('enforced', value);

      await ssoObj?.save();

      this.notify.success(`SSO enforce turned ${value ? 'ON' : 'OFF'}`);
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SsoSettings: typeof SsoSettingsComponent;
  }
}

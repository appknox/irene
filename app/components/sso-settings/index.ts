import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

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
  @tracked activeTab: string | null = null;

  spMetadataKeys = [
    { labelKey: 'entityID', valueKey: 'entity_id' },
    { labelKey: 'acsURL', valueKey: 'acs_url' },
    { labelKey: 'nameIDFormat', valueKey: 'named_id_format' },
  ];

  constructor(owner: unknown, args: SsoSettingsSignature['Args']) {
    super(owner, args);

    this.setDefaultTab.perform();
    this.getSSOData.perform();
  }

  get tabItems() {
    return [
      {
        id: 'saml',
        label: this.intl.t('samlAuth'),
        component: 'sso-settings/saml' as const,
      },
      {
        id: 'oidc',
        label: this.intl.t('oidc'),
        component: 'sso-settings/oidc' as const,
      },
    ];
  }

  get activeTabComponent() {
    return this.tabItems.find((t) => t.id === this.activeTab)?.component;
  }

  get hasOidc() {
    return this.providers && this.providers.length > 0;
  }

  get hasSaml() {
    return this.idpMetadata !== null;
  }

  get hasOidcOrSaml() {
    return this.hasOidc || this.hasSaml;
  }

  get isSamlTabActive() {
    return this.activeTab === 'saml';
  }

  get isOidcTabActive() {
    return this.activeTab === 'oidc';
  }

  get samlSteps() {
    return [
      this.intl.t('ssoSettings.saml.step1'),
      this.intl.t('ssoSettings.saml.step2'),
      this.intl.t('ssoSettings.saml.step3'),
    ];
  }

  get oidcSteps() {
    return [
      this.intl.t('ssoSettings.oidc.step1'),
      this.intl.t('ssoSettings.oidc.step2'),
      this.intl.t('ssoSettings.oidc.step3'),
    ];
  }

  @action
  onTabClick(tabId: string) {
    this.activeTab = tabId;
  }

  @action
  async refreshSsoData() {
    await this.getIdPMetadata.perform();
    await this.loadProviders.perform();
    await this.getSSOData.perform();
  }

  @action
  deleteIdpMetadata() {
    this.idpMetadata = null;
  }

  @action
  deleteProvider() {
    this.providers = [];
  }

  setDefaultTab = task(async () => {
    await this.getIdPMetadata.perform();
    await this.loadProviders.perform();

    if (this.providers?.length) {
      this.activeTab = 'oidc'; // OIDC tab
    } else if (this.idpMetadata) {
      this.activeTab = 'saml'; // SAML tab
    } else {
      this.activeTab = 'saml';
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
    } catch (err) {
      const error = err as AdapterError;

      if (error?.errors?.[0]?.status !== '404') {
        console.error('Failed to load IdP metadata:', error);
      }

      this.idpMetadata = null;
    }
  });

  loadProviders = task({ restartable: true }, async () => {
    try {
      const providers = await this.store.findAll('oidc-provider');
      this.providers = providers.toArray();
    } catch (err) {
      const error = err as AdapterError;

      if (error?.errors?.[0]?.status !== '404') {
        this.notify.error(this.intl.t('somethingWentWrong'));
        return;
      }

      this.providers = [];
    }
  });

  getSSOData = task(async () => {
    try {
      this.sso = await this.store.queryRecord('organization-sso', {});
    } catch (e) {
      // Catch error
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SsoSettings: typeof SsoSettingsComponent;
  }
}

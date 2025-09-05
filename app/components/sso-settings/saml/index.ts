import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import { type UploadFile } from 'ember-file-upload';

import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type Saml2IdPMetadataModel from 'irene/models/saml2-idp-metadata';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationSsoModel from 'irene/models/organization-sso';

interface SpMetadata {
  entity_id: string;
  acs_url: string;
  named_id_format: string;
  metadata: string;
}

export interface SsoSettingsSamlSignature {
  Args: {
    organization: OrganizationModel;
    user: UserModel;
    sso: OrganizationSsoModel | null;
    idpMetadata?: Saml2IdPMetadataModel | null;
    deleteIdpMetadata: () => void;
    refreshSsoData: () => void;
  };
}

export default class SsoSettingsSamlComponent extends Component<SsoSettingsSamlSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showDeleteIdpMetadataConfirm = false;
  @tracked spMetadata: SpMetadata | null = null;
  @tracked idpMetadataXml = '';
  @tracked spConfig: 'manual' | 'xml' = 'manual';

  spMetadataKeys = [
    { labelKey: 'entityID', valueKey: 'entity_id' },
    { labelKey: 'acsURL', valueKey: 'acs_url' },
    { labelKey: 'nameIDFormat', valueKey: 'named_id_format' },
  ];

  spConfigOptions = ['manual', 'xml'] as const;

  tPleaseTryAgain: string;

  constructor(owner: unknown, args: SsoSettingsSamlSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.SPMetadata.perform();
  }

  get spConfigIsManual() {
    return this.spConfig === 'manual';
  }

  get spConfigIsXml() {
    return this.spConfig === 'xml';
  }

  get showSsoToggle() {
    return !!this.args.idpMetadata;
  }

  // Switch SP config format
  @action
  handleSpConfigChange(event: Event) {
    const target = event.target as HTMLInputElement;

    this.spConfig = target.value as typeof this.spConfig;
  }

  @action
  cancelIdpMetadataXmlUpload() {
    this.idpMetadataXml = '';
  }

  // Delete IdP Metadata
  @action
  openDeleteIdpMetadataConfirm() {
    this.showDeleteIdpMetadataConfirm = true;
  }

  // Fetch SP Metadata
  SPMetadata = task({ restartable: true }, async () => {
    const spMetadata = await this.ajax.request<SpMetadata>(
      ENV.endpoints['saml2SPMetadata'] as string
    );

    this.spMetadata = spMetadata;
  });

  // Parse & upload IdP metadata
  parseIdpMetadataXml = task(async (file: UploadFile) => {
    const idpMetadataXml = (await file.readAsText()) as string;

    this.idpMetadataXml = idpMetadataXml;
  });

  uploadIdPMetadata = task({ restartable: true }, async (event: Event) => {
    event.preventDefault();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(
      this.idpMetadataXml,
      'application/xml'
    );

    const xmlHasError = xmlDoc.querySelector('parsererror');

    if (xmlHasError) {
      this.notify.error(this.intl.t('xmlError'));

      return;
    }

    try {
      const blob = new Blob([this.idpMetadataXml ?? ''], { type: 'text/xml' });
      const idpFormData = new FormData();

      idpFormData.append('filename', blob);

      const url = [
        ENV.endpoints['organizations'],
        this.args.organization.id,
        ENV.endpoints['saml2IdPMetadata'],
      ].join('/');

      await this.ajax.post(url, {
        data: idpFormData,
        contentType: null,
      });

      this.idpMetadataXml = '';
      this.notify.success(this.intl.t('ssoSettings.saml.successMessage'));
      this.args.refreshSsoData();
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  deleteIdpConfig = task({ restartable: true }, async () => {
    try {
      const ssoObj = await this.store.queryRecord('saml2-idp-metadata', {});

      ssoObj.deleteRecord();
      await ssoObj.save();
      this.args.deleteIdpMetadata();

      this.notify.success(this.intl.t('ssoSettings.saml.deletedIdp'));
      this.showDeleteIdpMetadataConfirm = false;
      this.args.refreshSsoData();
    } catch (err) {
      this.showDeleteIdpMetadataConfirm = false;
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::Saml': typeof SsoSettingsSamlComponent;
    'sso-settings/saml': typeof SsoSettingsSamlComponent;
  }
}

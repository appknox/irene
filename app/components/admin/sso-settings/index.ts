/* eslint-disable ember/no-jquery */
import $ from 'jquery';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

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

export interface AdminSsoSettingsSignature {
  Args: {
    organization: OrganizationModel;
    user: UserModel;
  };
}

export default class AdminSsoSettingsComponent extends Component<AdminSsoSettingsSignature> {
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

  spMetadataKeys = [
    { labelKey: 'entityID', valueKey: 'entity_id' },
    { labelKey: 'acsURL', valueKey: 'acs_url' },
    { labelKey: 'nameIDFormat', valueKey: 'named_id_format' },
  ];

  tPleaseTryAgain: string;
  tSomethingWentWrongContactSupport: string;
  tRemovedSSOSuccessfully: string;

  constructor(owner: unknown, args: AdminSsoSettingsSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tSomethingWentWrongContactSupport = this.intl.t(
      'somethingWentWrongContactSupport'
    );
    this.tRemovedSSOSuccessfully = this.intl.t('removedSSOSuccessfully');

    this.SPMetadata.perform();
    this.getIdPMetadata.perform();
    this.getSSOData.perform();
  }

  // Switch SP config format
  @action
  handleSpConfigChange(event: Event) {
    const target = event.target as HTMLSelectElement;

    this.spConfig = target.value;
  }

  get spConfigIsManual() {
    return this.spConfig === 'manual';
  }

  get spConfigIsXml() {
    return this.spConfig === 'xml';
  }

  // Fetch SP Metadata
  SPMetadata = task({ restartable: true }, async () => {
    const spMetadata = await this.ajax.request<SpMetadata>(
      ENV.endpoints['saml2SPMetadata'] as string
    );

    this.spMetadata = spMetadata;
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

  getSSOData = task(async () => {
    try {
      this.sso = await this.store.queryRecord('organization-sso', {});
    } catch (e) {
      this.notify.error(parseError(e));
    }
  });

  // Parse & upload IdP metadata
  parseIdpMetadataXml = task(async (file) => {
    const idpMetadataXml = await file.readAsText();

    this.idpMetadataXml = idpMetadataXml;
  });

  @action
  cancelIdpMetadataXmlUpload() {
    this.idpMetadataXml = null;
  }

  uploadIdPMetadata = task({ restartable: true }, async (event) => {
    event.preventDefault();

    try {
      $.parseXML(this.idpMetadataXml!);
    } catch (err) {
      this.notify.error('Please enter a valid XML file');

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

      this.idpMetadataXml = null;

      this.notify.success('Uploaded IdP Metadata Config successfully');

      this.getIdPMetadata.perform();
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  // Delete IdP Metadata
  @action
  openDeleteIdpMetadataConfirm() {
    this.showDeleteIdpMetadataConfirm = true;
  }

  deleteIdpConfig = task({ restartable: true }, async () => {
    try {
      const ssoObj = await this.store.queryRecord('saml2-idp-metadata', {});

      await ssoObj.deleteRecord();
      await ssoObj.save();
      await this.store.unloadAll('saml2-idp-metadata');

      this.notify.success('Deleted IdP Metadata Config successfully');
      this.showDeleteIdpMetadataConfirm = false;
      this.idpMetadata = null;
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
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
    'Admin::SsoSettings': typeof AdminSsoSettingsComponent;
  }
}

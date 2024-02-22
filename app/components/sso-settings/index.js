/* eslint-disable ember/no-jquery */
import $ from 'jquery';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

export default class SsoSettingsComponent extends Component {
  @service intl;
  @service ajax;
  @service store;
  @service('notifications') notify;

  @tracked showDeleteIdpMetadataConfirm = false;
  @tracked spMetadata = null;
  @tracked idpMetadata = null;
  @tracked idpMetadataXml = null;
  @tracked spConfig = 'manual';

  spMetadataKeys = [
    { labelKey: 'entityID', valueKey: 'entity_id' },
    { labelKey: 'acsURL', valueKey: 'acs_url' },
    { labelKey: 'nameIDFormat', valueKey: 'named_id_format' },
  ];

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  tSomethingWentWrongContactSupport = this.intl.t(
    'somethingWentWrongContactSupport'
  );
  tRemovedSSOSuccessfully = this.intl.t('removedSSOSuccessfully');

  constructor() {
    super(...arguments);

    this.SPMetadata.perform();
    this.getIdPMetadata.perform();
  }

  get sso() {
    return this.store.queryRecord('organization-sso', {});
  }

  // Switch SP config format
  @action
  handleSpConfigChange(event) {
    this.spConfig = event.target.value;
  }

  get spConfigIsManual() {
    return this.spConfig == 'manual';
  }

  get spConfigIsXml() {
    return this.spConfig == 'xml';
  }

  // Fetch SP Metadata
  SPMetadata = task({ restartable: true }, async () => {
    const spMetadata = await this.ajax.request(ENV.endpoints.saml2SPMetadata);
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

  // Parse & upload IdP metadata
  parseIdpMetadataXml = task(async (file) => {
    let idpMetadataXml = await file.readAsText();
    this.idpMetadataXml = idpMetadataXml;
  });

  @action
  cancelIdpMetadataXmlUpload() {
    this.idpMetadataXml = null;
  }

  uploadIdPMetadata = task({ restartable: true }, async (event) => {
    event.preventDefault();

    try {
      $.parseXML(this.idpMetadataXml);
    } catch (err) {
      this.notify.error('Please enter a valid XML file');

      return;
    }

    try {
      const blob = new Blob([this.idpMetadataXml], { type: 'text/xml' });
      let idpFormData = new FormData();
      idpFormData.append('filename', blob);

      const url = [
        ENV.endpoints.organizations,
        this.args.organization.id,
        ENV.endpoints.saml2IdPMetadata,
      ].join('/');

      await this.ajax.post(url, {
        data: idpFormData,
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
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
      ssoObj.set('enabled', value);

      await waitForPromise(ssoObj.save());

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
      ssoObj.set('enforced', value);

      await waitForPromise(ssoObj.save());

      this.notify.success(`SSO enforce turned ${value ? 'ON' : 'OFF'}`);
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });
}

/* eslint-disable ember/no-jquery */
import $ from 'jquery';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { tracked } from '@glimmer/tracking';

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
  @task({ restartable: true })
  *SPMetadata() {
    const spMetadata = yield this.ajax.request(ENV.endpoints.saml2SPMetadata);
    this.spMetadata = spMetadata;
  }

  // Fetch IdP Metadata
  @task({ restartable: true })
  *getIdPMetadata() {
    try {
      const idpMetadata = yield this.store.queryRecord(
        'saml2-idp-metadata',
        {}
      );

      this.idpMetadata = idpMetadata;
    } catch (error) {
      // catch error
    }
  }

  // Parse & upload IdP metadata
  @task
  *parseIdpMetadataXml(file) {
    let idpMetadataXml = yield file.readAsText();
    this.idpMetadataXml = idpMetadataXml;
  }

  @action
  cancelIdpMetadataXmlUpload() {
    this.idpMetadataXml = null;
  }

  @task({ restartable: true })
  *uploadIdPMetadata(event) {
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

      yield this.ajax.post(url, {
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
  }

  // Delete IdP Metadata
  @action
  openDeleteIdpMetadataConfirm() {
    this.showDeleteIdpMetadataConfirm = true;
  }

  @task({ restartable: true })
  *deleteIdpConfig() {
    try {
      const ssoObj = yield this.store.queryRecord('saml2-idp-metadata', {});

      yield ssoObj.deleteRecord();
      yield ssoObj.save();
      yield this.store.unloadAll('saml2-idp-metadata');

      this.notify.success('Deleted IdP Metadata Config successfully');
      this.showDeleteIdpMetadataConfirm = false;
      this.idpMetadata = null;
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  }

  // Enable SSO
  @task({ restartable: true })
  *toggleSSOEnable(event, value) {
    try {
      const ssoObj = this.store.peekRecord(
        'organization-sso',
        this.args.organization.id
      );
      ssoObj.set('enabled', value);

      yield ssoObj.save();

      this.notify.success(
        `SSO authentication ${value ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  }

  // Enforce SSO
  @task({ restartable: true })
  *toggleSSOEnforce(event, value) {
    try {
      const ssoObj = this.store.peekRecord(
        'organization-sso',
        this.args.organization.id
      );
      ssoObj.set('enforced', value);

      yield ssoObj.save();

      this.notify.success(`SSO enforce turned ${value ? 'ON' : 'OFF'}`);
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  }
}

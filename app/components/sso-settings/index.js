import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { action } from '@ember/object';

export default class SsoSettingsComponent extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;
  @service store;

  @tracked showDeleteIdpMetadataConfirm = false;
  @tracked spMetadata = null;
  @tracked idpMetadata = null;
  @tracked idpMetadataXml = null;
  spConfig = 'manual';

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  tSomethingWentWrongContactSupport = this.intl.t(
    'somethingWentWrongContactSupport'
  );
  tRemovedSSOSuccessfully = this.intl.t('removedSSOSuccessfully');

  @action
  initializeComp() {
    this.fetchSpMetadata.perform();
    this.fetchIdpMetadata.perform();
  }

  get sso() {
    return this.store.queryRecord('organization-sso', {});
  }

  get organization() {
    return this.args.organization;
  }

  @action
  onSelectXmlFile(file) {
    this.parseIdpMetadataXml.perform(file);
  }

  @action
  onUploadIdpMetadata() {
    this.uploadIdPMetadata.perform();
  }

  @action
  onToggleDeleteIdpMetadataModal() {
    this.showDeleteIdpMetadataConfirm = !this.showDeleteIdpMetadataConfirm;
  }

  @action
  onDeleteIdpConfig() {
    this.deleteIdpConfig.perform();
  }

  // Fetch SP Metadata
  @task(function* () {
    this.spMetadata = yield this.ajax.request(ENV.endpoints.saml2SPMetadata);
    console.log('spmetadata', this.spMetadata);
  })
  fetchSpMetadata;

  // Fetch IdP Metadata
  @task(function* () {
    this.idpMetadata = yield this.store.queryRecord('saml2-idp-metadata', {});
  })
  fetchIdpMetadata;

  // Parse & upload IdP metadata
  @task(function* (file) {
    yield (this.idpMetadataXml = yield file.readAsText());
  })
  parseIdpMetadataXml;

  @task(function* () {
    try {
      // $.parseXML(this.get('idpMetadataXml'));
      const parser = new DOMParser();
      parser.parseFromString(this.idpMetadataXml, 'text/xml');
    } catch (err) {
      console.log('err', err);
      this.notify.error('Please enter a valid XML file');
      throw new Error('Please enter a valid XML file');
    }
    try {
      const blob = new Blob([this.idpMetadataXml], { type: 'text/xml' });
      let idpFormData = new FormData();
      idpFormData.append('filename', blob);

      const url = [
        ENV.endpoints.organizations,
        this.organization.id,
        ENV.endpoints.saml2IdPMetadata,
      ].join('/');
      yield this.ajax.post(url, {
        data: idpFormData,
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
      });

      yield (this.idpMetadataXml = null);

      this.notify.success('Uploaded IdP Metadata Config successfully');
      this.fetchIdpMetadata.perform();
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  })
  uploadIdPMetadata;

  @task(function* () {
    try {
      const ssoObj = yield this.store.queryRecord('saml2-idp-metadata', {});
      yield ssoObj.deleteRecord();
      yield ssoObj.save();
      yield this.store.unloadAll('saml2-idp-metadata');
      this.notify.success('Deleted IdP Metadata Config successfully');
      this.onToggleDeleteIdpMetadataModal();
      this.idpMetadata = null;
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  })
  deleteIdpConfig;

  // Enable SSO
  @task(function* (x) {
    try {
      const ssoObj = this.store.peekRecord(
        'organization-sso',
        this.get('organization.id')
      );
      ssoObj.set('enabled', value);
      yield ssoObj.save();

      if (value) {
        this.get('notify').success('SSO authentication enabled');
      } else {
        this.get('notify').success('SSO authentication disabled');
      }
    } catch (err) {
      this.get('notify').error(parseError(err, this.get('tPleaseTryAgain')));
    }
  })
  toggleSSOEnable;

  // Enforce SSO
  @task(function* (value) {
    try {
      const ssoObj = this.store.peekRecord(
        'organization-sso',
        this.get('organization.id')
      );
      ssoObj.set('enforced', value);
      yield ssoObj.save();
      if (value) {
        this.get('notify').success('SSO enforce turned ON');
      } else {
        this.get('notify').success('SSO enforce turned OFF');
      }
    } catch (err) {
      this.get('notify').error(parseError(err, this.get('tPleaseTryAgain')));
    }
  })
  toggleSSOEnforce;
}

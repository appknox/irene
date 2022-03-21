/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-component-lifecycle-hooks, ember/no-get, ember/no-jquery */
import $ from 'jquery';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

export default Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notifications'),

  organization: null,
  showDeleteIdpMetadataConfirm: false,
  spMetadata: null,
  idpMetadata: null,
  idpMetadataXml: null,
  spConfig: 'manual',

  tPleaseTryAgain: t("pleaseTryAgain"),
  tSomethingWentWrongContactSupport: t("somethingWentWrongContactSupport"),
  tRemovedSSOSuccessfully: t('removedSSOSuccessfully'),


  didInsertElement(){
this._super(...arguments);
    this.get('SPMetadata').perform();
    this.get('getIdPMetadata').perform();
  },


  sso: computed('store', function() {
    return this.get('store').queryRecord('organization-sso', {});
  }),


  // Switch SP config format
  spConfigIsManual: computed('spConfig', function() {
    return this.get('spConfig') == 'manual'
  }),
  spConfigIsXml: computed('spConfig', function() {
    return this.get('spConfig') == 'xml'
  }),


  // Fetch SP Metadata
  SPMetadata: task(function *(){
    const spMetadata = yield this.get('ajax').request(ENV.endpoints.saml2SPMetadata);
    this.set('spMetadata', spMetadata);
  }).restartable(),


  // Fetch IdP Metadata
  getIdPMetadata: task(function *() {
    const idpMetadata = yield this.get('store').queryRecord('saml2-idp-metadata', {});
    this.set('idpMetadata', idpMetadata);
  }).restartable(),


  // Parse & upload IdP metadata
  parseIdpMetadataXml: task(function *(file){
    let idpMetadataXml = yield file.readAsText();
    yield this.set('idpMetadataXml', idpMetadataXml);
  }),

  uploadIdPMetadata: task(function * () {
    try {
      $.parseXML(this.get('idpMetadataXml'));
    } catch(err){
      throw new Error('Please enter a valid XML file');
    }

    const blob = new Blob([this.get('idpMetadataXml')], { type: "text/xml"});
    let idpFormData = new FormData();
    idpFormData.append('filename', blob);

    const url = [ENV.endpoints.organizations, this.get('organization.id'), ENV.endpoints.saml2IdPMetadata].join('/');
    yield this.get('ajax').post(url, {
      data: idpFormData,
      processData: false,
      contentType: false,
      mimeType: "multipart/form-data",
    });

    yield this.set('idpMetadataXml', null);
  }).evented().restartable(),

  uploadIdPMetadataSucceeded: on('uploadIdPMetadata:succeeded', function() {
    this.get('notify').success('Uploaded IdP Metadata Config successfully');
    this.get('getIdPMetadata').perform();
  }),

  uploadIdPMetadataErrored: on('uploadIdPMetadata:errored', function(_, err){
    this.get('notify').error(parseError(err, this.get('tPleaseTryAgain')));
  }),


  // Delete IdP Metadata
  openDeleteIdpMetadataConfirm: task(function * () {
    yield this.set('showDeleteIdpMetadataConfirm', true);
  }),

  deleteIdpConfig: task(function *() {
    const ssoObj = yield this.store.queryRecord('saml2-idp-metadata', {});
    yield ssoObj.deleteRecord();
    yield ssoObj.save();
    yield this.store.unloadAll('saml2-idp-metadata');
  }).evented().restartable(),

  deleteIdpConfigSucceeded: on('deleteIdpConfig:succeeded', function() {
    this.get('notify').success('Deleted IdP Metadata Config successfully');
    this.set('showDeleteIdpMetadataConfirm', false);
    this.set('idpMetadata', null);
  }),

  deleteIdpConfigErrored: on('deleteIdpConfig:errored', function(_, err){
    this.get('notify').error(parseError(err, this.get('tPleaseTryAgain')));
  }),


  // Enable SSO
  toggleSSOEnable: task(function *(value) {
    const ssoObj = this.store.peekRecord('organization-sso', this.get('organization.id'));
    ssoObj.set('enabled', value);
    yield ssoObj.save();
  }).evented().restartable(),

  toggleSSOEnableSucceeded: on('toggleSSOEnable:succeeded', function(taskInstance) {
    const [toggleValue] = taskInstance.args;
    if (toggleValue) {
      this.get('notify').success('SSO authentication enabled');
    } else {
      this.get('notify').success('SSO authentication disabled');
    }
  }),

  toggleSSOEnableErrored: on('toggleSSOEnable:errored', function(_, err){
    this.get('notify').error(parseError(err, this.get('tPleaseTryAgain')));
  }),


  // Enforce SSO
  toggleSSOEnforce: task(function *(value) {
    const ssoObj = this.store.peekRecord('organization-sso', this.get('organization.id'));
    ssoObj.set('enforced', value);
    yield ssoObj.save();
  }).evented().restartable(),

  toggleSSOEnforceSucceeded: on('toggleSSOEnforce:succeeded', function(taskInstance) {
    const [toggleValue] = taskInstance.args;
    if (toggleValue) {
      this.get('notify').success('SSO enforce turned ON');
    } else {
      this.get('notify').success('SSO enforce turned OFF');
    }
  }),

  toggleSSOEnforceErrored: on('toggleSSOEnforce:errored', function(_, err){
    this.get('notify').error(parseError(err, this.get('tPleaseTryAgain')));
  }),

});

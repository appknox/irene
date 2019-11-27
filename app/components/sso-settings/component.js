import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';

export default Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),


  // sso: null,
  organization: null,
  showAddSSOModal: false,
  // spMetadata: null,
  tPleaseTryAgain: t("pleaseTryAgain"),
  xmlData: null,
  showDeleteIdpMetadataConfirm: false,
  tSomethingWentWrongContactSupport: t("somethingWentWrongContactSupport"),
  tRemovedSSOSuccessfully: t('removedSSOSuccessfully'),

  spConfig: 'manual',

  didInsertElement(){
    this.get('getSPMetadata').perform();
    // this.get('getIdPMetadata').perform();
  },

  // Fetch SP Metadata
  getSPMetadata: task(function *(){
    const spMetadata = yield this.get('ajax').request(ENV.endpoints.saml2SPMetadata);
    this.set('spMetadata', spMetadata);
  }),


  // Switch SP config format
  spConfigIsManual: computed('spConfig', function() {
    return this.get('spConfig') == 'manual'
  }),
  spConfigIsXml: computed('spConfig', function() {
    return this.get('spConfig') == 'xml'
  }),

  // Fetch IdP Metadata
  idpMetadata: computed('organization.id', function() {
    return this.get('store').queryRecord('saml2-idp-metadata', {});
  }),

  // // Fetch IdP Metadata
  // getIdPMetadata: task(function *(){
  //   // try {
  //   //   const url = `organizations/${this.get('organization.id')}/sso/saml2/idp_metadata`;
  //   //   const sso = yield this.get('ajax').request(url);
  //   //   yield this.set('sso', sso);
  //   // } catch(error) {
  //   //   throw error;
  //   // }
  // }).evented(),

  // getIdPMetadataErrored: on('getIdPMetadata:errored', function(_, err){
  //   if (err.status!==404) {
  //     this.get('notify').error(err.message);
  //   }
  // }),

  // openMultiSSOModal: task(function *(){
  //   yield this.set('showAddSSOModal', true);
  // }),



  // getSPMetadataErrored: on('getSPMetadata:errored', function(){
  //   this.get('notify').error(this.get('tSomethingWentWrongContactSupport'));
  // }),

  enableSSO: task(function * () {
    try{
      // eslint-disable-next-line no-undef
      $.parseXML(this.$('textarea').val());
    }catch(err){
      this.get('notify').error("Please enter a valid XML file.")
      return;
    }
    const blob = new Blob([this.$('textarea').val()], { type: "text/xml"});
    let idpFormData = new FormData();
    idpFormData.append('filename', blob);
    const url = `organizations/${this.get('organization.id')}/integrate_saml/`;
    const data = yield this.get('ajax').post(url,{
      data: idpFormData,
      processData: false,
      contentType: false,
      mimeType: "multipart/form-data",
    })
    yield this.set('sso', data);
    // yield this.get('getSPMetadata').perform();
    yield this.set('showAddSSOModal',false)
  }).evented(),

  enableSSOErrored: on('enableSSO:errored', function(_, err){
    const status = err.status;
    if(status===400){
      if (err.payload.filename) {
        this.get('notify').error(err.payload.filename[0])
        return;
      }
    }
    this.get('notify').error(this.get('tSomethingWentWrongContactSupport'));
  }),

  openDeleteIdpMetadataConfirm: task(function * () {
    yield this.set('showDeleteIdpMetadataConfirm', true);
  }),

  deleteIdpConfig: task(function *(){
    const url = `organizations/${this.get('organization.id')}/integrate_saml/`;
    yield this.get('ajax').delete(url);
    yield this.set('sso', null);
  }).evented(),

  deleteIdpConfigSucceeded: on('deleteIdpConfig:succeeded', function() {
    this.get('notify').success('Deleted IdP Metadata Config successfully');
    this.set('showDeleteIdpMetadataConfirm', false);
  }),

  disableDeleteEnforceSSO: task(function *(selectedOption){
    const url = `organizations/${this.get('organization.id')}/integrate_saml/`;
    let updateFormData = new FormData();
    if (selectedOption==="disable-enable"){
      updateFormData.append('enabled', !this.get('sso.enabled'))
      const data = yield this.get('ajax').put(url,{
        data: updateFormData,
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
      });
      yield this.set('sso', data);
      return;
    }
    if (selectedOption==="enforce"){
      this.set('sso.enabled', true);
      updateFormData.append('enforced', !this.get('sso.enforced'));
      updateFormData.append('enabled', this.get('sso.enabled'));
      const data = yield this.get('ajax').put(url,{
        data: updateFormData,
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
      });
      yield this.set('sso', data);
      return;
    }
    yield this.get('ajax').delete(url);
    yield this.get('notify').success(this.get('tRemovedSSOSuccessfully'))
    yield this.set('sso', null);
    yield this.set('xmlData', null);
  }).evented(),

  disableDeleteEnforceSSOErrored: on('disableDeleteEnforceSSO:errored', function(_, err){
    const status = err.status;
    if(status===400){
      if (err.payload.filename) {
        this.set('sso', null)
        this.get('notify').error(err.payload.filename[0])
        return;
      }
      if (err.payload.enabled) {
        this.set('sso.enabled', null)
        this.get('notify').error(err.payload.enabled[0])
        return;
      }
      if (err.payload.enforced) {
        this.set('sso.enforced', null)
        this.get('notify').error(err.payload.enforced[0])
        return;
      }
    }
    this.get('notify').error(this.get('tPleaseTryAgain'));
  }),
  uploadFileWrapper: task(function *(file){
    let xmlData = yield file.readAsText();
    yield this.set('xmlData', xmlData)
  })
});

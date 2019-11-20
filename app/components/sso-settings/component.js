import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';

export default Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),

  ssoSettings: null,
  showAddSSOModal: false,
  serviceProvider: null,
  tPleaseTryAgain: t("pleaseTryAgain"),
  xmlData: null,
  showDeleteIdpMetadataConfirm: false,
  tSomethingWentWrongContactSupport: t("somethingWentWrongContactSupport"),
  tRemovedSSOSuccessfully: t('removedSSOSuccessfully'),

  spConfig: 'manual',

  didInsertElement(){
    this.get('checkMultiSSO').perform()
  },

  spConfigIsManual: computed('spConfig', function() {
    return this.get('spConfig') == 'manual'
  }),

  spConfigIsXml: computed('spConfig', function() {
    return this.get('spConfig') == 'xml'
  }),

  checkMultiSSO: task(function *(){
    try{
      const url = `organizations/${this.get('organization.id')}/integrate_saml/`;
      const ssoSettings = yield this.get('ajax').request(url);
      yield this.set('ssoSettings', ssoSettings);
      yield this.get('getServiceProviderDetail').perform();
    }catch(error){
      throw error;
    }

  }).evented(),

  checkMultiSSOErrored: on('checkMultiSSO:errored', function(_, err){
    if (err.status!==404){
      this.get('notify').error(err.message);
    }
  }),

  openMultiSSOModal: task(function *(){
    yield this.set('showAddSSOModal', true);
  }),

  getServiceProviderDetail: task(function *(){
    const serviceProvider = yield this.get('ajax').request(`organizations/${this.get('organization.id')}/sp_info`);
    this.set('serviceProvider', serviceProvider);
  }).evented(),

  getServiceProviderDetailErrored: on('getServiceProviderDetail:errored', function(){
    this.get('notify').error(this.get('tSomethingWentWrongContactSupport'));
  }),

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
    yield this.set('ssoSettings', data);
    yield this.get('getServiceProviderDetail').perform();
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
    yield this.set('ssoSettings', null);
  }).evented(),

  deleteIdpConfigSucceeded: on('deleteIdpConfig:succeeded', function() {
    this.get('notify').success('Deleted IdP Metadata Config successfully');
    this.set('showDeleteIdpMetadataConfirm', false);
  }),

  disableDeleteEnforceSSO: task(function *(selectedOption){
    const url = `organizations/${this.get('organization.id')}/integrate_saml/`;
    let updateFormData = new FormData();
    if (selectedOption==="disable-enable"){
      updateFormData.append('enabled', !this.get('ssoSettings.enabled'))
      const data = yield this.get('ajax').put(url,{
        data: updateFormData,
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
      });
      yield this.set('ssoSettings', data);
      return;
    }
    if (selectedOption==="enforce"){
      this.set('ssoSettings.enabled', true);
      updateFormData.append('enforced', !this.get('ssoSettings.enforced'));
      updateFormData.append('enabled', this.get('ssoSettings.enabled'));
      const data = yield this.get('ajax').put(url,{
        data: updateFormData,
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
      });
      yield this.set('ssoSettings', data);
      return;
    }
    yield this.get('ajax').delete(url);
    yield this.get('notify').success(this.get('tRemovedSSOSuccessfully'))
    yield this.set('ssoSettings', null);
    yield this.set('xmlData', null);
  }).evented(),

  disableDeleteEnforceSSOErrored: on('disableDeleteEnforceSSO:errored', function(_, err){
    const status = err.status;
    if(status===400){
      if (err.payload.filename) {
        this.set('ssoSettings', null)
        this.get('notify').error(err.payload.filename[0])
        return;
      }
      if (err.payload.enabled) {
        this.set('ssoSettings.enabled', null)
        this.get('notify').error(err.payload.enabled[0])
        return;
      }
      if (err.payload.enforced) {
        this.set('ssoSettings.enforced', null)
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

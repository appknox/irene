import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'irene/config/environment';
// import ENUMS from 'irene/enums';
// import { translationMacro as t } from 'ember-i18n';
// import triggerAnalytics from 'irene/utils/trigger-analytics';
// import poll from 'irene/services/poll';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import ProxySettingValidation from 'irene/validations/proxy-setting';
import { task } from 'ember-concurrency';

export default Component.extend({
  i18n: service(),
  notify: service('notification-messages-service'),

  currentProxy:null,
  proxyPOJO: {},

  init() {
    this._super(...arguments);
    const proxyPOJO = this.get('proxyPOJO');
    const changeset = new Changeset(
      proxyPOJO, lookupValidator(ProxySettingValidation), ProxySettingValidation
    );
    this.set('changeset', changeset);
  },

  proxyId: computed('profile.id', function() {
    return this.get('profile.id');
  }),

  getCurrentProxy: task(function * (){
    var proxyId = this.get('proxyId');
    if (proxyId) {
      return yield this.get('store').findRecord('proxy-setting', proxyId);
    }
    return null;
  }),

  syncSettings: task(function * () {
    let changeset = this.get('changeset');
    let currentProxy = yield this.get('getCurrentProxy').perform();
    yield this.set('currentProxy', currentProxy);
    yield changeset.set('host', currentProxy.get('host'));
    yield changeset.set('port', parseInt(currentProxy.get('port')));
    this.set('changeset', changeset);
  }).on('didInsertElement'),

  applyProxyAPI: task(function *(changeset){
    yield changeset.validate()
    if (!changeset.get('isValid')) {
      if(changeset.get('errors') && changeset.get('errors')[0].validation) {
        this.get('notify').error(
          changeset.get('errors')[0].validation[0],
          ENV.notifications
        );
      }
      return;
    }
    let currentProxy = yield this.get('currentProxy');
    const enabled = currentProxy.get('enabled');
    const host = changeset.get('host');
    const port = changeset.get('port');
    try{
      currentProxy.setProperties({
        'enabled': enabled,
        'host': host,
        'port': port,
      })
      yield currentProxy.save()
      this.set('currentProxy', currentProxy);
    }catch(error){
      if(error.payload) {
        if(error.payload.host) {
          this.get('notify').error(error.payload.host[0], ENV.notifications)
        }
        if(error.payload.port) {
          this.get('notify').error(error.payload.port[0], ENV.notifications)
        }
      }
    }
  }),
  saveProxyAPI: task(function *(changeset){
    yield changeset.validate()
    if (!changeset.get('isValid')) {
      if(changeset.get('errors') && changeset.get('errors')[0].validation) {
        this.get('notify').error(
          changeset.get('errors')[0].validation[0],
          ENV.notifications
        );
      }
      return;
    }
    let currentProxy = yield this.get('currentProxy');
    const enabled = !currentProxy.get('enabled');
    const host = changeset.get('host');
    const port = changeset.get('port');
    try{
      currentProxy.setProperties({
        'enabled': enabled,
        'host': host,
        'port': port,
      })
      yield currentProxy.save()
      this.set('currentProxy', currentProxy);
    } catch(error){
      if(error.payload) {
        if(error.payload.host) {
          this.get('notify').error(error.payload.host[0], ENV.notifications)
        }
        if(error.payload.port) {
          this.get('notify').error(error.payload.port[0], ENV.notifications)
        }
      }
    }
  }),
});

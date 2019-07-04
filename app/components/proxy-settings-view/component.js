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
import ProxySettingValidation from 'irene/validations/proxy-settings';
import { task, waitForProperty } from 'ember-concurrency';

export default Component.extend({
  i18n: service(),
  notify: service('notification-messages-service'),

  currentProxy: null,
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

  hasProxyValues: computed('currentProxy.{host,port}', function() {
    return !!this.get('currentProxy.host') && !!this.get('currentProxy.port');
  }),

  getCurrentProxy: task(function * (){
    yield waitForProperty(this, 'profile.id', function(pid) {
      return !!pid
    });
    const proxyId = this.get('proxyId');
    let record = yield this.get('store').findRecord('proxy-setting', proxyId);
    return record;
  }),

  syncSettings: task(function * () {
    let currentProxy = yield this.get('getCurrentProxy').perform();
    if(!currentProxy) {
      return;
    }
    yield this.set('currentProxy', currentProxy);

    let changeset = yield this.get('changeset');
    yield changeset.set('host', currentProxy.get('host'));
    yield changeset.set('port', parseInt(currentProxy.get('port')));
    yield changeset.set('enabled', currentProxy.get('enabled'));
    this.set('changeset', changeset);
  }).on('init'),

  saveChanges: task(function *() {
    const changeset = this.get('changeset');
    yield changeset.validate();
    const isValid = changeset.get('isValid');
    if(!isValid) {
      if(changeset.get('errors') && changeset.get('errors')[0].validation) {
        this.get('notify').error(
          changeset.get('errors')[0].validation[0],
          ENV.notifications
        );
      }
      return false;
    }
    var currentProxy = yield this.get('currentProxy');
    yield currentProxy.setProperties({
      'host': changeset.get('host'),
      'port': changeset.get('port'),
      'enabled': changeset.get('enabled'),
    });
    yield currentProxy.save();
    return true;
  }),

  enableProxy: task(function *(event) {
    const changeset = this.get('changeset');
    changeset.set('enabled', event.target.checked);
    const status = yield this.get('saveChanges').perform();
    const statusText = changeset.get('enabled') ? 'ON' : 'OFF';
    if (status) {
      this.get('notify').info('Proxy turned ' + statusText);
    } else {
      if(event.target.checked) {
        this.get('notify').error(changeset.get('errors')[0].validation[0])
      }
      event.preventDefault();
    }
  }),
});

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, waitForProperty } from 'ember-concurrency';
import { t } from 'ember-intl';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import ENV from 'irene/config/environment';
import ProxySettingValidation from 'irene/validations/proxy-settings';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend({
  intl: service(),
  notify: service('notifications'),

  tProxySettingsSaved: t('proxySettingsSaved'),
  tProxyTurned: t('proxyTurned'),
  tOn: t('on'),
  tOff: t('off'),

  currentProxy: null,
  changeset: null,

  proxyId: computed.reads('profile.id'),

  hasProxyValues: computed('changeset.{host,port}', function() {
    return !!this.get('changeset.host') && !!this.get('changeset.port');
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
    const changeset = new Changeset(
      currentProxy,
      lookupValidator(ProxySettingValidation),
      ProxySettingValidation
    );
    this.set('currentProxy', currentProxy);
    this.set('changeset', changeset);
  }).on('init'),

  clearProxy: task(function *() {
    const currentProxy = yield this.get('currentProxy');
    yield currentProxy.destroyRecord();
    yield currentProxy.unloadRecord();
    yield this.get('syncSettings').perform();
    return false;
  }),

  saveChanges: task(function *() {
    const changeset = this.get('changeset');
    yield changeset.validate();
    const isValid = changeset.get('isValid');
    if(!isValid) {
      if (!(changeset.get('host') || changeset.get('port'))) {
        return yield this.get('clearProxy').perform();
      }
      if (changeset.get('errors') && changeset.get('errors')[0].validation) {
        this.get('notify').error(
          changeset.get('errors')[0].validation[0],
          ENV.notifications
        );
      }
      return false;
    }
    yield changeset.save()
    return true;
  }),

  saveProxy: task(function *() {
    const status = yield this.get('saveChanges').perform();
    if (status) {
      this.get('notify').success(this.get('tProxySettingsSaved'));
      triggerAnalytics('feature', ENV.csb.changeProxySettings);
    }
  }),

  enableProxy: task(function *(event) {
    const changeset = this.get('changeset');
    let enabled = event.target.checked;
    changeset.set('enabled', enabled);
    const status = yield this.get('saveChanges').perform();
    const statusText = changeset.get('enabled') ? this.get('tOn') : this.get('tOff');
    if (status) {
      this.get('notify').info(this.get('tProxyTurned') + statusText.toUpperCase());
      if (enabled) {
        triggerAnalytics('feature', ENV.csb.enableProxy);
      } else {
        triggerAnalytics('feature', ENV.csb.disableProxy);
      }
    } else {
      if (enabled) {
        this.get('notify').error(changeset.get('errors')[0].validation[0]);
      }
      event.preventDefault();
    }
  }),
});

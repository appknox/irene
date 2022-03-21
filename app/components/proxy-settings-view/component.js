/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend({
  intl: service(),
  notify: service('notifications'),

  tProxyTurned: t('proxyTurned'),
  tPleaseTryAgain: t('plaseTryAgain'),
  tOn: t('on'),
  tOff: t('off'),

  proxy: computed('profile.id', 'store', function() {
    let profileId = this.get('profile.id');
    return this.get('store').findRecord('proxy-setting', profileId);
  }),

  /* Proxy enable or disable */
  toggleProxy: task(function *(event) {
    let enabled = event.target.checked;

    var proxy = yield this.get('proxy');
    proxy.set('enabled', enabled);
    yield proxy.save();
  }).evented(),

  toggleProxySucceeded: on('toggleProxy:succeeded', function() {
    let enabled = this.get('proxy.enabled');
    const statusText = enabled ? this.get('tOn') : this.get('tOff');
    this.get('notify').info(this.get('tProxyTurned') + statusText.toUpperCase());
    if (enabled) {
      triggerAnalytics('feature', ENV.csb.enableProxy);
    } else {
      triggerAnalytics('feature', ENV.csb.disableProxy);
    }
  }),

  toggleProxyErrored: on('toggleProxy:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),

});

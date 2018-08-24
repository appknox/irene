import Ember from 'ember';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { translationMacro as t } from 'ember-i18n';

const NamespaceComponentComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  tagName: ['tr'],
  showRejectNamespaceConfirm: false,
  isRejectingNamespace: false,
  tNamespaceRejected: t('namespaceRejected'),

  approveNamespace: task(function * () {
    const ns = this.get('namespace');
    ns.set('isApproved', true);
    triggerAnalytics('feature', ENV.csb.namespaceAdded);
    yield ns.save();
  }),

  rejectNamespaceConfirm: task(function * () {
    yield this.set('showRejectNamespaceConfirm', true);
  }),
  confirmReject: task(function * () {
    this.set('isRejectingNamespace', true);
    const ns = this.get('namespace');
    ns.deleteRecord();
    yield ns.save();
  }).evented(),
  confirmRejectSucceeded: on('confirmReject:succeeded', function() {
    this.get('notify').success(this.get('tNamespaceRejected'));
  }),
  confirmRejectErrored: on('confirmReject:errored', function(_, error) {
    this.get("notify").error(error.message);
  }),

  actions: {
    confirmRejectProxy() {
      this.get('confirmReject').perform();
    }
  }
});

export default NamespaceComponentComponent;

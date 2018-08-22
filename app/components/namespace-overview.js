import Ember from 'ember';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const NamespaceComponentComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  tagName: ['tr'],
  showRejectNamespaceConfirm: false,
  isRejectingNamespace: false,

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
  }),

  actions: {
    confirmRejectProxy() {
      this.get('confirmReject').perform();
    }
  }
});

export default NamespaceComponentComponent;

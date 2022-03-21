/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-get, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { t } from 'ember-intl';

export default Component.extend({
  intl: service(),
  me: service(),
  notify: service('notifications'),

  tagName: ['tr'],
  showRejectNamespaceConfirm: false,
  isRejectingNamespace: false,
  isApprovingNamespace: false,

  tNamespaceApproved: t('namespaceApproved'),
  tNamespaceRejected: t('namespaceRejected'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  /* Approve namespace action */
  approveNamespace: task(function * () {
    this.set('isApprovingNamespace', true);

    const ns = this.get('namespace');
    ns.set('isApproved', true);
    yield ns.save();
  }).evented(),

  approveNamespaceSucceeded: on('approveNamespace:succeeded', function() {
    this.get('notify').success(this.get("tNamespaceApproved"));
    triggerAnalytics('feature', ENV.csb.namespaceAdded);

    this.set('isApprovingNamespace', false);
  }),

  approveNamespaceErrored: on('approveNamespace:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);

    this.set('isApprovingNamespace', false);
  }),


  /* Open reject-namespace confirmation */
  rejectNamespaceConfirm: task(function * () {
    yield this.set('showRejectNamespaceConfirm', true);
  }),


  /* Reject namespace action */
  confirmReject: task(function * () {
    this.set('isRejectingNamespace', true);

    const ns = this.get('namespace');
    ns.deleteRecord();
    yield ns.save();

  }).evented(),

  confirmRejectSucceeded: on('confirmReject:succeeded', function() {
    this.get('notify').success(this.get('tNamespaceRejected'));
    triggerAnalytics('feature', ENV.csb.namespaceRejected);

    this.set('showRejectNamespaceConfirm', false);
    this.set('isRejectingNamespace', false);
  }),

  confirmRejectErrored: on('confirmReject:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);

    this.set('isRejectingNamespace', false);
  }),


  actions: {
    confirmRejectProxy() {
      this.get('confirmReject').perform();
    }
  }

});

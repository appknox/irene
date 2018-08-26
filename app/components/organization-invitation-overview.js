import Ember from 'ember';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';
import { translationMacro as t } from 'ember-i18n';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  tagName: ['tr'],
  isDeletingInvitation: false,
  isResendingInvitation: false,
  showDeleteInvitationConfirmBox: false,
  showResendInvitationConfirmBox: false,

  tInvitationReSent: t('invitationReSent'),
  tInvitationDeleted: t('invitationDeleted'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  /* Open resend-invitation confirmation */
  openResendInvitationConfirmBox: task(function * () {
    yield this.set('showResendInvitationConfirmBox', true);
  }),


  /* Resend invitation */
  confirmResend: task(function * () {
    this.set('isResendingInvitation', true);

    const invite = this.get('invitation');
    // TODO: hit /resend endpoint
    yield invite.save();

  }).evented(),

  confirmResendSucceeded: on('confirmResend:succeeded', function() {
    this.get('notify').success(this.get('tInvitationReSent'));
    triggerAnalytics('feature', ENV.csb.inviteResend);

    this.set('showResendInvitationConfirmBox', false);
    this.set('isResendingInvitation', false);
  }),

  confirmResendErrored: on('confirmResend:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }

    this.get("notify").error(errMsg);

    this.set('showResendInvitationConfirmBox', false);
    this.set('isResendingInvitation', false);
  }),


  /* Open delete-invitation confirmation */
  openDeleteInvitationConfirmBox: task(function * () {
    yield this.set('showDeleteInvitationConfirmBox', true);
  }),


  /* Delete invitation */
  confirmDelete: task(function * () {
    this.set('isDeletingInvitation', true);

    const invite = this.get('invitation');
    invite.deleteRecord();
    yield invite.save();

  }).evented(),

  confirmDeleteSucceeded: on('confirmDelete:succeeded', function() {
    this.get('notify').success(this.get('tInvitationDeleted'));
    triggerAnalytics('feature', ENV.csb.inviteDelete);

    this.set('showDeleteInvitationConfirmBox', false);
    this.set('isDeletingInvitation', false);
  }),

  confirmDeleteErrored: on('confirmDelete:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }

    this.get("notify").error(errMsg);

    this.set('showDeleteInvitationConfirmBox', false);
    this.set('isDeletingInvitation', false);
  }),


  actions: {
    confirmResendProxy() {
      this.get('confirmResend').perform();
    },
    confirmDeleteProxy() {
      this.get('confirmDelete').perform();
    },
  }
});

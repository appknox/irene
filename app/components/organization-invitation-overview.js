import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

const OrgInvitationComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  tagName: ['tr'],

  tInvitationDeleted: t('invitationDeleted'),
  tInvitationReSent: t('invitationReSent'),

  isDeletingInvitation: false,
  isResendingInvitation: false,

  showDeleteInvitationConfirmBox: false,
  showResendInvitationConfirmBox: false,

  notify: Ember.inject.service('notification-messages-service'),

  openResendInvitationConfirmBox: task(function * () {
    yield this.set('showResendInvitationConfirmBox', true);
  }),
  confirmResend: task(function * () {
    this.set('isResendingInvitation', true);
    const invite = this.get('invitation');
    // TODO: hit /resend endpoint
    yield invite.save();
  }).evented(),
  confirmResendSucceeded: on('confirmResend:succeeded', function() {
    this.get('notify').success(this.get('tInvitationReSent'));
  }),
  confirmResendErrored: on('confirmResend:errored', function(_, error) {
    this.get("notify").error(error.message);
  }),

  openDeleteInvitationConfirmBox: task(function * () {
    yield this.set('showDeleteInvitationConfirmBox', true);
  }),
  confirmDelete: task(function * () {
    this.set('isDeletingInvitation', true);
    const invite = this.get('invitation');
    invite.deleteRecord();
    yield invite.save();

  }).evented(),
  confirmDeleteSucceeded: on('confirmDelete:succeeded', function() {
    this.get('notify').success(this.get('tInvitationDeleted'));
  }),
  confirmDeleteErrored: on('confirmDelete:errored', function(_, error) {
    this.get("notify").error(error.message);
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

export default OrgInvitationComponent;

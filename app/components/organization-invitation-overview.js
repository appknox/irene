import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';

const OrgInvitationComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  tagName: ['tr'],
  tInvitation: t('invitation'),
  tDeleted: t('deleted'),
  tInvitationDeleted: t('invitationDeleted'),

  isDeletingInvitation: false,
  isResendingInvitation: false,

  showDeleteInvitationConfirmBox: false,
  showResendInvitationConfirmBox: false,

  notify: Ember.inject.service('notification-messages-service'),

  openResendInvitationConfirmBox: task(function * () {
    yield this.set('showResendInvitationConfirmBox', true);
  }),
  openDeleteInvitationConfirmBox: task(function * () {
    yield this.set('showDeleteInvitationConfirmBox', true);
  }),

  confirmResend: task(function * () {
    this.set('isResendingInvitation', true);
    const invite = this.get('invitation');
    // TODO: hit /resend endpoint
    yield invite.save();
  }),
  confirmDelete: task(function * () {
    this.set('isDeletingInvitation', true);
    const invite = this.get('invitation');
    invite.deleteRecord();
    yield invite.save();
    this.get('notify').success(this.get('tInvitationDeleted'));
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

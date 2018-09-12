import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  realtime: Ember.inject.service(),

  email: '',
  isInvitingMember: false,
  showInviteMemberModal: false,

  tEmptyEmailId: t("emptyEmailId"),
  tOrgMemberInvited: t('orgMemberInvited'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  /* Open invite-member modal */
  openInviteMemberModal: task(function * () {
    yield this.set('showInviteMemberModal', true);
  }),


  /* Send invitation */
  inviteMember: task(function * () {
    const email = this.get("email");
    if(Ember.isEmpty(email)) {
      throw new Error(this.get('tEmptyEmailId'));
    }

    this.set('isInvitingMember', true);

    const t = this.get('team');
    if (t) {
      yield t.createInvitation({email});
    } else {
      const orgInvite = yield this.get('store').createRecord('organization-invitation', {email});
      yield orgInvite.save();
    }

    // signal to update invitation list
    this.get('realtime').incrementProperty('InvitationCounter');
  }).evented(),

  inviteMemberSucceeded: on('inviteMember:succeeded', function() {
    this.get('notify').success(this.get("tOrgMemberInvited"));

    this.set("email", '');
    this.set('showInviteMemberModal', false);
    this.set('isInvitingMember', false);
  }),

  inviteMemberErrored: on('inviteMember:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get("notify").error(errMsg);
    this.set('isInvitingMember', false);
  })

});

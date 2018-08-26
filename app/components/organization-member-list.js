import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  realtime: Ember.inject.service(),

  targetObject: 'organization-member',
  sortProperties: ['createdOn:desc'],
  email: '',
  isInvitingMember: false,
  showInviteMemberModal: false,


  /* Open invite-member modal */
  openInviteMemberModal: task(function * () {
    yield this.set('showInviteMemberModal', true);
  }),


  /* Send invitation */
  inviteMember: task(function * () {
    const email = this.get("email");
    if(Ember.isEmpty(email)) {
      throw new Error(t("emptyEmailId"));
    }

    this.set('isInvitingMember', true);

    const invite = this.get('store').createRecord('organization-invitation', {email});
    yield invite.save();

    // signal to update invitation list
    this.get('realtime').incrementProperty('InvitationCounter');
  }).evented(),

  inviteMemberSucceeded: on('inviteMember:succeeded', function() {
    this.get('notify').success(t("orgMemberInvited"));

    this.set("email", '');
    this.set('showInviteMemberModal', false);
    this.set('isInvitingMember', false);
  }),

  inviteMemberErrored: on('inviteMember:errored', function(_, err) {
    let errMsg = t('pleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);

    this.set("email", '');
    this.set('showInviteMemberModal', false);
    this.set('isInvitingMember', false);
  })

});

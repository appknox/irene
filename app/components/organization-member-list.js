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
  tEmptyEmailId: t("emptyEmailId"),
  tOrgMemberInvited: t("orgMemberInvited"),
  email: '',
  isInvitingMember: false,
  showInviteMemberModal: false,

  openInviteMemberModal: task(function * () {
    yield this.set('showInviteMemberModal', true);
  }),

  inviteMember: task(function * () {
    const email = this.get("email");
    if(Ember.isEmpty(email)) {
      throw new Error(this.get("tEmptyEmailId"));
    }

    this.set('isInvitingMember', true);
    const invite = this.get('store').createRecord('organization-invitation', {email});
    yield invite.save();

    this.get('realtime').incrementProperty('InvitationCounter');
  }).evented(),

  inviteMemberSucceeded: on('inviteMember:succeeded', function() {
    this.get('notify').success(this.get('tOrgMemberInvited'));
    this.set("email", '');
    this.set('showInviteMemberModal', false);
    this.set('isInvitingMember', false);
  }),
  inviteMemberErrored: on('inviteMember:errored', function(_, error) {
    let errMsg = t('pleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message
    }
    this.get("notify").error(errMsg);
    this.set("email", '');
    this.set('showInviteMemberModal', false);
    this.set('isInvitingMember', false);
  })
});

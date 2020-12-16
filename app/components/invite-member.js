import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import PaginateMixin from 'irene/mixins/paginate';
import {
  t
} from 'ember-intl';
import {
  task
} from 'ember-concurrency';
import ENV from 'irene/config/environment';
import {
  on
} from '@ember/object/evented';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import parseEmails from 'irene/utils/parse-emails';

export default Component.extend(PaginateMixin, {
  intl: service(),
  realtime: service(),

  email: '',
  isInvitingMember: false,
  showInviteMemberModal: false,

  tEmptyEmailId: t("emptyEmailId"),
  tOrgMemberInvited: t('orgMemberInvited'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  /* Open/Close invite-member modal */
  toggleInviteMemberModal: task(function* () {
    yield this.set('showInviteMemberModal', !this.get('showInviteMemberModal'));
  }),

  inviteMember: task(function* (email) {
    const t = this.get('team');
    if (t) {
      yield t.createInvitation({
        email
      });
    } else {
      const orgInvite = yield this.get('store').createRecord('organization-invitation', {
        email
      });
      yield orgInvite.save();
    }

    // signal to update invitation list
    this.get('realtime').incrementProperty('InvitationCounter');
  }).enqueue().maxConcurrency(3),

  /* Send invitation */
  inviteMembers: task(function* () {
    const emails = yield parseEmails(this.get('emailsFromText'));
    if (!emails.length) {
      throw new Error(this.get('tEmptyEmailId'));
    }
    this.set('isInvitingMember', true);

    for (let i = 0; i < emails.length; i++) {
      yield this.get('inviteMember').perform(emails[i]);
    }
  }).evented(),

  inviteMembersSucceeded: on('inviteMembers:succeeded', function () {
    this.get('notify').success(this.get("tOrgMemberInvited"));
    this.set("email", '');
    this.set('showInviteMemberModal', false);
    this.set('isInvitingMember', false);
    triggerAnalytics('feature', ENV.csb.inviteMember);
  }),

  inviteMembersErrored: on('inviteMembers:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get("notify").error(errMsg);
    this.set('isInvitingMember', false);
  })

});

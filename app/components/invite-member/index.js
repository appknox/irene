import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import ENV from 'irene/config/environment';
import { action } from '@ember/object';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import parseEmails from 'irene/utils/parse-emails';
import { tracked } from '@glimmer/tracking';

export default class InviteMemberComponent extends Component {
  @service intl;
  @service realtime;
  @service store;
  @service('notifications') notify;

  @tracked emailsFromText = '';
  @tracked isInvitingMember = false;
  @tracked emailErrorMsg = '';

  tOrgMemberInvited = this.intl.t('orgMemberInvited');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  get emailList() {
    return this.emailsFromText
      .split(',')
      .filter((e) => Boolean(e.trim()))
      .map((e) => e.trim());
  }

  @action
  handleEmailDelete(index) {
    const el = this.emailList;

    el.splice(index, 1);

    this.emailsFromText = el.join(', ');
  }

  @task({ enqueue: true, maxConcurrency: 3 })
  *inviteMember(email) {
    const t = this.args.team;

    if (t) {
      yield t.createInvitation({ email });
    } else {
      const orgInvite = yield this.store.createRecord(
        'organization-invitation',
        { email }
      );

      yield orgInvite.save();
    }

    // signal to update invitation list
    this.realtime.incrementProperty('InvitationCounter');
  }

  /* Send invitation */
  @task
  *inviteMembers(closeHandler) {
    try {
      const emails = yield parseEmails(this.emailsFromText);

      if (!emails.length) {
        this.emailErrorMsg = this.intl.t('emptyEmailId');

        return;
      }

      this.emailErrorMsg = '';
      this.isInvitingMember = true;

      for (let i = 0; i < emails.length; i++) {
        yield this.inviteMember.perform(emails[i]);
      }

      // cleanup or close function
      if (typeof closeHandler === 'function') {
        closeHandler();
      }

      this.notify.success(this.tOrgMemberInvited);

      this.emailsFromText = '';
      this.isInvitingMember = false;

      triggerAnalytics('feature', ENV.csb.inviteMember);
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isInvitingMember = false;
    }
  }
}

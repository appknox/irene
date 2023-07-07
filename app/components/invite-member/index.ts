import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { action } from '@ember/object';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import parseEmails from 'irene/utils/parse-emails';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import StoreService from '@ember-data/store';
import RealtimeService from 'irene/services/realtime';
import OrganizationModel from 'irene/models/organization';
import OrganizationTeamModel from 'irene/models/organization-team';

interface InviteMemberSignature {
  Args: {
    organization: OrganizationModel;
    team?: OrganizationTeamModel;
    reloadMembers?: () => void;
  };
  Element: HTMLDivElement;
  Blocks: {
    default?: () => void;
    actionContent?: [
      {
        action: () => void;
        actionLabel: string;
        actionRunning: boolean;
      }
    ];
  };
}

export default class InviteMemberComponent extends Component<InviteMemberSignature> {
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;
  @service declare store: StoreService;
  @service('notifications') declare notify: NotificationService;

  @tracked emailsFromText = '';
  @tracked isInvitingMember = false;
  @tracked emailErrorMsg = '';

  get emailList() {
    return this.emailsFromText
      .split(',')
      .filter((e) => Boolean(e.trim()))
      .map((e) => e.trim());
  }

  @action
  handleEmailDelete(index: number) {
    const el = this.emailList;

    el.splice(index, 1);

    this.emailsFromText = el.join(', ');
  }

  inviteMember = task({ enqueue: true, maxConcurrency: 3 }, async (email) => {
    const t = this.args.team;

    if (t) {
      await t.createInvitation({ email });
    } else {
      const orgInvite = await this.store.createRecord(
        'organization-invitation',
        { email }
      );

      await orgInvite.save();
    }

    // signal to update invitation list
    this.realtime.incrementProperty('InvitationCounter');
  });

  /* Send invitation */
  inviteMembers = task(async (closeHandler) => {
    try {
      const emails = await parseEmails(this.emailsFromText);

      if (!emails.length) {
        this.emailErrorMsg = this.intl.t('emptyEmailId');

        return;
      }

      this.emailErrorMsg = '';
      this.isInvitingMember = true;

      for (let i = 0; i < emails.length; i++) {
        await this.inviteMember.perform(emails[i]);
      }

      // cleanup or close function
      if (typeof closeHandler === 'function') {
        closeHandler();
      }

      this.notify.success(this.intl.t('orgMemberInvited'));

      this.emailsFromText = '';
      this.isInvitingMember = false;

      triggerAnalytics(
        'feature',
        ENV.csb['inviteMember'] as CsbAnalyticsFeatureData
      );
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err?.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isInvitingMember = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    InviteMember: typeof InviteMemberComponent;
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ProfileVaNotifEmailModel from 'irene/models/profile-va-notif-email';

interface ProjectSettingsAnalysisSettingsEmailNotificationsSignature {
  Args: {
    profileId?: number;
  };
}

export default class ProjectSettingsAnalysisSettingsEmailNotificationsComponent extends Component<ProjectSettingsAnalysisSettingsEmailNotificationsSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked newEmail = '';
  @tracked emails: ProfileVaNotifEmailModel[] = [];

  VA_EMAIL_MODEL_NAME = 'profile-va-notif-email' as const;

  constructor(
    owner: unknown,
    args: ProjectSettingsAnalysisSettingsEmailNotificationsSignature['Args']
  ) {
    super(owner, args);

    this.fetchEmails.perform();
  }

  get isDisableSave() {
    return isEmpty(this.newEmail.trim());
  }

  setProfileNamespace() {
    const adapter = this.store.adapterFor(this.VA_EMAIL_MODEL_NAME);
    adapter.setNestedUrlNamespace(String(this.args.profileId));
  }

  fetchEmails = task(async () => {
    this.setProfileNamespace();

    const emails = await this.store.findAll(this.VA_EMAIL_MODEL_NAME);
    this.emails = emails.slice();
  });

  addNewEmail = task(async () => {
    this.setProfileNamespace();

    const email = this.newEmail;

    const emailInfo = this.store.createRecord(this.VA_EMAIL_MODEL_NAME, {
      email,
    });

    try {
      await emailInfo.save();

      this.notify.success(`${email} ${this.intl.t('addedSuccessfully')}`);

      this.emails = [emailInfo, ...this.emails];
      this.newEmail = '';
    } catch (err) {
      emailInfo.rollbackAttributes();
      this.notify.error(parseError(err, email));
    }
  });

  deleteEmail = task(async (email: ProfileVaNotifEmailModel, index: number) => {
    this.setProfileNamespace();

    try {
      email.deleteRecord();
      email.save();

      this.emails = this.emails.filter((d) => d.id !== email.id);

      this.notify.success('Email deleted');
    } catch (err) {
      this.emails.splice(index, 0, email);
      this.emails = [...this.emails];

      this.notify.error(parseError(err, 'Problem while deleting email'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings::EmailNotifications': typeof ProjectSettingsAnalysisSettingsEmailNotificationsComponent;
  }
}

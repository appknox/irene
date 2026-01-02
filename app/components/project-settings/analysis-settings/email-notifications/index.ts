import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { waitForPromise } from '@ember/test-waiters';
import { Changeset } from 'ember-changeset';
import { action } from '@ember/object';
import lookupValidator from 'ember-changeset-validations';
import type { BufferedChangeset } from 'ember-changeset/types';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ProfileVaNotifEmailValidator from './validator';
import type ProfileVaNotifEmailModel from 'irene/models/profile-va-notif-email';

type ProfileVaNotifEmailFields = { email: string };

type ChangesetBufferProps = BufferedChangeset &
  ProfileVaNotifEmailFields & {
    error: {
      [key in keyof ProfileVaNotifEmailFields]:
        | boolean
        | { validation: string };
    };
  };

interface ProjectSettingsAnalysisSettingsEmailNotificationsSignature {
  Args: {
    profileId?: number;
  };
}

export default class ProjectSettingsAnalysisSettingsEmailNotificationsComponent extends Component<ProjectSettingsAnalysisSettingsEmailNotificationsSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked newEmailPOJO: ProfileVaNotifEmailFields = { email: '' };
  @tracked emails: ProfileVaNotifEmailModel[] = [];
  @tracked changeset: ChangesetBufferProps | null = null;

  VA_EMAIL_MODEL_NAME = 'profile-va-notif-email' as const;

  constructor(
    owner: unknown,
    args: ProjectSettingsAnalysisSettingsEmailNotificationsSignature['Args']
  ) {
    super(owner, args);

    this.fetchEmails.perform();

    this.changeset = Changeset(
      this.newEmailPOJO,
      lookupValidator(ProfileVaNotifEmailValidator),
      ProfileVaNotifEmailValidator,
      { skipValidate: true }
    ) as ChangesetBufferProps;
  }

  get disableSaveEmailBtn() {
    return isEmpty(this.changeset?.email.trim());
  }

  @action
  setProfileNamespace() {
    const adapter = this.store.adapterFor(this.VA_EMAIL_MODEL_NAME);
    adapter.setNestedUrlNamespace(String(this.args.profileId));
  }

  fetchEmails = task(async () => {
    this.setProfileNamespace();

    try {
      const emails = await this.store.query(this.VA_EMAIL_MODEL_NAME, {});
      this.emails = emails.slice();
    } catch (err) {
      this.notify.error(
        parseError(err, this.intl.t('problemWhileFetchingEmails'))
      );
    }
  });

  addNewEmail = task(async () => {
    await this.changeset?.validate();

    // Check if email is valid
    if (this.changeset?.error?.email) {
      this.notify.error(this.intl.t('invalidEmailAddress'));

      return;
    }

    // Check if email already exists
    const email = this.changeset?.email.toLowerCase();

    if (this.emails.some((d) => d.email.toLowerCase() === email)) {
      this.notify.error(this.intl.t('emailAlreadyAdded'));

      return;
    }

    this.setProfileNamespace();

    const emailInfo = this.store.createRecord(this.VA_EMAIL_MODEL_NAME, {
      email,
    });

    try {
      await emailInfo.save();

      this.emails = [emailInfo, ...this.emails];

      this.changeset?.rollback();
      this.notify.success(`${email} ${this.intl.t('addedSuccessfully')}`);
    } catch (err) {
      emailInfo.rollbackAttributes();
      this.notify.error(parseError(err, email));
    }
  });

  deleteEmail = task(async (email: ProfileVaNotifEmailModel) => {
    this.setProfileNamespace();

    try {
      email.deleteRecord();
      await waitForPromise(email.save());

      this.emails = this.emails.filter((d) => d.id !== email.id);

      this.notify.success(this.intl.t('emailDeleted'));
    } catch (err) {
      this.notify.error(
        parseError(err, this.intl.t('problemWhileDeletingEmail'))
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings::EmailNotifications': typeof ProjectSettingsAnalysisSettingsEmailNotificationsComponent;
  }
}

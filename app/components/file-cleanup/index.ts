import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type { BufferedChangeset } from 'ember-changeset/types';

import FileCleanupValidations from 'irene/validations/file-cleanup';

interface FileCleanupFields {
  isEnabled: boolean;
  filesToKeep: string;
  lastCleanedAt: Date;
}

type ChangesetBufferProps = BufferedChangeset &
  FileCleanupFields & {
    error: {
      [key in keyof FileCleanupFields]: { validation: string };
    };
  };

export interface FileCleanupSignature {
  Element: HTMLElement;
}

export default class FileCleanupComponent extends Component<FileCleanupSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked isShowAllCleanup = false;
  @tracked isHideSettings = false;
  @tracked changeset: ChangesetBufferProps = {} as ChangesetBufferProps;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.loadCleanupPref.perform();
  }

  @action
  onChangePref(changeset: BufferedChangeset, inType?: string) {
    if (inType === 'checkbox') {
      changeset.set('isEnabled', !changeset.get('isEnabled'));
    }

    changeset.validate().then(() => {
      if (changeset?.get('isValid')) {
        this.saveCleanupPref.perform();
      }
    });
  }

  @action
  onTriggerCleanup() {
    this.triggerFileCleanup.perform();
  }

  @action
  onViewAllCleanup() {
    this.isShowAllCleanup = !this.isShowAllCleanup;
  }

  @action
  onCloseModal() {
    this.isShowAllCleanup = false;
  }

  /**
   * @function saveCleanupPref
   * Method to update cleanup setting changes
   */
  saveCleanupPref = task({ restartable: true }, async () => {
    try {
      await this.changeset?.save();

      this.notify.success(this.intl.t('fileCleanup.msg.saveSuccess'));
    } catch (error) {
      const err = error as AdapterError;

      this.notify.error(String(err.errors?.[0]?.detail));
    }
  });

  /**
   * @function loadCleanupPref
   * Method to load cleanup preference for the active organization
   */
  loadCleanupPref = task(async () => {
    try {
      const cleanupPref = await this.store.queryRecord(
        'organization-cleanup-preference',
        {}
      );

      this.changeset = Changeset(
        cleanupPref,
        lookupValidator(FileCleanupValidations),
        FileCleanupValidations
      ) as ChangesetBufferProps;
    } catch (error) {
      const err = error as AdapterError;
      this.isHideSettings = err.errors?.[0]?.status === '404';
    }
  });

  /**
   * @function triggerFileCleanup
   * Method to trigger a new file cleanup activity
   */
  triggerFileCleanup = task({ restartable: true }, async () => {
    try {
      await this.store.createRecord('organization-cleanup', {}).save();
      this.notify.success(this.intl.t('fileCleanup.msg.triggerSuccess'));
    } catch (error) {
      const err = error as AdapterError;
      this.notify.error(String(err.errors?.[0]?.detail));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileCleanup: typeof FileCleanupComponent;
    'file-cleanup': typeof FileCleanupComponent;
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import type { BufferedChangeset } from 'ember-changeset/types';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import FileCleanup from 'irene/validations/file-cleanup';
import type IreneAjaxService from 'irene/services/ajax';

export default class FileCleanupComponent extends Component {
  @service declare store: Store;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked cleanupPref: any;
  @tracked isShowAllCleanup = false;
  @tracked isHideSettings = false;
  @tracked changeset: BufferedChangeset | null = null;

  @action
  onChangePref(changeset: BufferedChangeset, inType: string) {
    if (inType == 'checkbox') {
      changeset.set('isEnabled', !changeset.get('isEnabled'));
    }
    changeset.validate().then(() => {
      if (changeset.get('isValid')) {
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
      if (!this.changeset) {
        return;
      }

      await this.changeset.save();
      this.notify.success(this.intl.t('fileCleanup.msg.saveSuccess'));
    } catch (error) {
      const err = error as any;
      this.notify.error(err[0].detail);
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.changeset = new Changeset(
        cleanupPref,
        lookupValidator(FileCleanup),
        FileCleanup
      );
    } catch (error) {
      const err = error as AdapterError;
      this.isHideSettings = err?.errors?.[0]?.status == '404';
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
      const err = error as any;
      this.notify.error(err[0].detail);
    }
  });
}

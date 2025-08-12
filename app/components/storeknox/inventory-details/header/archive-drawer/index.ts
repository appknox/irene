import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxInventoryDetailsHeaderArchiveDrawerSignature {
  Args: {
    open: boolean;
    onClose: () => void;
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsHeaderArchiveDrawerComponent extends Component<StoreknoxInventoryDetailsHeaderArchiveDrawerSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get nextArchiveActionDate() {
    return dayjs().add(6, 'month').format('MMM DD, YYYY');
  }

  get drawerMessages() {
    const isArchived = this.skInventoryApp.isArchived;

    const lockPeriodMessageKey = isArchived
      ? 'storeknox.unarchiveLockPeriodMessage'
      : 'storeknox.archiveLockPeriodMessage';

    return {
      lockPeriodMessage: this.intl.t(lockPeriodMessageKey, {
        htmlSafe: true,
        appTitle: this.skInventoryApp.appMetadata.title,
      }),

      lockPeriodNote: isArchived
        ? ''
        : this.intl.t('storeknox.archiveLockPeriodNote', {
            htmlSafe: true,
            date: this.nextArchiveActionDate,
          }),

      confirmButtonText: this.intl.t(
        isArchived ? 'storeknox.unarchive' : 'storeknox.archive'
      ),
    };
  }

  @action confirmArchiveApp() {
    this.doArchiveApp.perform();
  }

  doArchiveApp = task(async () => {
    const appInitiallyArchived = this.skInventoryApp.isArchived;

    try {
      await this.skInventoryApp?.toggleArchiveStatus();
      await this.skInventoryApp?.reload();

      this.args.onClose();

      this.notify.success(
        this.intl.t(
          appInitiallyArchived
            ? 'storeknox.appUnarchivedSuccessfully'
            : 'storeknox.appArchivedSuccessfully'
        )
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::Header::ArchiveDrawer': typeof StoreknoxInventoryDetailsHeaderArchiveDrawerComponent;
  }
}

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';

import parseError from 'irene/utils/parse-error';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryArchivedAppsTableActionSignature {
  Args: {
    skApp?: SkAppModel;
    loading?: boolean;
    reloadArchivedAppsTable: () => Promise<void>;
  };
}

export default class StoreknoxInventoryArchivedAppsTableActionComponent extends Component<StoreknoxInventoryArchivedAppsTableActionSignature> {
  @service('notifications') declare notify: NotificationService;

  get skApp() {
    return this.args.skApp;
  }

  get isUnarchiveDisabled() {
    return !this.skApp?.canUnarchive || this.doUnarchive.isRunning;
  }

  @action unarchiveApp(e: Event) {
    e.stopPropagation();
    this.doUnarchive.perform();
  }

  doUnarchive = task(async () => {
    try {
      await this.skApp?.toggleArchiveStatus();
      await this.args.reloadArchivedAppsTable();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/archived-apps/table/action': typeof StoreknoxInventoryArchivedAppsTableActionComponent;
  }
}

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import AmAppModel from 'irene/models/am-app';
import AmAppSyncModel from 'irene/models/am-app-sync';

interface AppMonitoringTableScannedStatusSignature {
  Args: {
    amAppSync: AmAppSyncModel;
  };
}

export default class AppMonitoringHistoryTableScannedStatusComponent extends Component<AppMonitoringTableScannedStatusSignature> {
  @service declare store: Store;

  @tracked amApp: AmAppModel | null = null;

  constructor(
    owner: unknown,
    args: AppMonitoringTableScannedStatusSignature['Args']
  ) {
    super(owner, args);
    this.fetchAmApp.perform();
  }

  fetchAmApp = task(async () => {
    const amAppId = this.args.amAppSync.amApp.get('id');

    if (amAppId) {
      const amApp = await this.store.findRecord('am-app', amAppId);
      this.amApp = amApp;
    }
  });
}

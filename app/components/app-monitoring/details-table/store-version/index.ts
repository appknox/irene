import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import AmAppVersionModel from 'irene/models/am-app-version';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import AmAppModel from 'irene/models/am-app';

interface AppMonitoringDetailsTableStoreVersionSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
  };
}

export default class AppMonitoringDetailsTableStoreVersionComponent extends Component<AppMonitoringDetailsTableStoreVersionSignature> {
  @service declare store: Store;

  @tracked amApp: AmAppModel | null = null;

  constructor(
    owner: unknown,
    args: AppMonitoringDetailsTableStoreVersionSignature['Args']
  ) {
    super(owner, args);
    this.fetchAmApp.perform();
  }

  fetchAmApp = task(async () => {
    const amAppId = this.args.amAppVersion.amApp?.get('id');

    if (amAppId) {
      const amApp = await this.store.findRecord('am-app', amAppId);
      this.amApp = amApp;
    }
  });
}

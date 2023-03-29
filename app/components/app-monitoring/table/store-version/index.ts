import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { AmAppVersionQuery } from 'irene/adapters/am-app-version';
import AmAppVersionModel from 'irene/models/am-app-version';
import AmAppModel from 'irene/models/am-app';

interface AppMonitoringTableStatusSignature {
  Args: {
    amApp: AmAppModel;
  };
}

export default class AppMonitoringTableStoreVersionComponent extends Component<AppMonitoringTableStatusSignature> {
  @service declare store: Store;

  @tracked
  latestAmAppVersions: AmAppVersionModel[] = [];

  constructor(owner: unknown, args: AppMonitoringTableStatusSignature['Args']) {
    super(owner, args);
    this.fetchAmAppLatestVersions.perform();
  }

  get amApp() {
    return this.args.amApp;
  }

  get hasMultipleVersions() {
    // The multiple versions is dependent on the unique number of comparableVersions of the latest versions
    const versionComparableVersions = this.latestAmAppVersions.map((version) =>
      version.get('comparableVersion').trim()
    );

    const uniqueComparableVersions = new Set(versionComparableVersions);
    const hasMultipleVersions = uniqueComparableVersions.size > 1;

    return hasMultipleVersions;
  }

  fetchAmAppLatestVersions = task(async () => {
    const query = {
      amAppId: this.amApp.id,
      latestVersions: true,
    } as AmAppVersionQuery;

    // Fetch the latest versions for
    const latestAmAppVersions = await this.store.query('am-app-version', query);
    const versions = latestAmAppVersions.toArray();

    this.latestAmAppVersions = versions;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'app-monitoring/table/store-version': typeof AppMonitoringTableStoreVersionComponent;
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AppMonitoringTableRowComponent extends Component {
  @tracked status = '';

  constructor(...args) {
    super(...args);
    this.getAppStatus.perform();
  }

  get am_app() {
    return this.args.amApp;
  }

  get project() {
    return this.am_app.project || null;
  }

  get latest_am_app_version() {
    return this.am_app.latest_am_app_version || null;
  }

  @task(function* () {
    const latest_am_app_version = yield this.latest_am_app_version;
    if (latest_am_app_version === null) {
      if (this.am_app.am_app_syncs?.length === 0) {
        this.status = 'pending';
      } else {
        this.status = 'not-found';
      }
    } else if (this.am_app.monitoring_enabled) {
      this.status = 'is-active';
    } else {
      this.status = 'inactive';
    }
  })
  getAppStatus;
}

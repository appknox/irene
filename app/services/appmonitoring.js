import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';

export default class AppMonitoringService extends Service {
  @service store;
  @service('notifications') notify;

  @tracked appMonitoringData = [];

  @tracked limit = 10;
  @tracked offset = 0;

  @task(function* () {
    try {
      const monitoringData = yield this.store.query('am-app', {
        limit: this.limit,
        offset: this.offset,
      });
      this.appMonitoringData = monitoringData;
    } catch {
      this.notify.error(
        'Failed to load App Monitoring Data. Check your network and try again.',
        ENV.notifications
      );
    }
  })
  fetch;

  get isFetchingAMData() {
    return this.fetch.isRunning;
  }

  async reload() {
    await this.fetch.perform();
  }

  setLimitOffset({ limit = 10, offset = 0 }) {
    this.limit = limit;
    this.offset = offset;
    return this;
  }
}

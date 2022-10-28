import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from 'irene/config/environment';

export default class AppMonitoringService extends Service {
  @service store;
  @service('notifications') notify;

  @tracked appMonitoringData = [];
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked isFetchingAMData = false;

  async fetchAppMonitoringData(limit = 10, offset = 0) {
    this.isFetchingAMData = true;

    try {
      const monitoringData = await this.store.query('am-app', {
        limit: limit,
        offset: offset,
      });

      this.appMonitoringData = monitoringData;
      this.limit = limit;
      this.offset = offset;

      this.isFetchingAMData = false;
    } catch {
      this.notify.error(
        'Failed to load App Monitoring Data. Check your network and try again.',
        ENV.notifications
      );

      this.isFetchingAMData = false;
    }
  }

  async reloadAMData() {
    this.fetchAppMonitoringData(this.limit, this.offset);
  }

  async load() {
    await this.fetchAppMonitoringData(this.limit, this.offset);
  }
}

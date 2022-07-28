import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'irene/config/environment';

export default class AppMonitoringDrawerComponent extends Component {
  @tracked hasError = false;
  @tracked isGeoLocationError = true;

  constructor(...args) {
    super(...args);
  }

  get appDetails() {
    return this.args.appDetails;
  }

  get scanStatus() {
    return this.appDetails?.status;
  }

  get scannedOnDate() {
    return this.appDetails?.scannedOnDate || '-';
  }

  get fileId() {
    return this.appDetails?.file_id;
  }

  get platform() {
    return this.appDetails?.platform;
  }

  get lastScannedVersion() {
    return this.appDetails?.version;
  }

  get versionInProd() {
    return this.appDetails?.production_version;
  }

  get appName() {
    return this.appDetails?.name;
  }

  get namespace() {
    return this.appDetails?.package_name;
  }

  get appURL() {
    return this.appDetails?.app_url;
  }

  get ireneFilePath() {
    if (this.fileId) {
      const ireneHost = ENV.ireneHost;
      return [ireneHost, 'file', this.fileId].join('/');
    }
    return '';
  }
}

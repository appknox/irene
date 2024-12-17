import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import IntlService from 'ember-intl/services/intl';
import AmAppVersionModel from 'irene/models/am-app-version';

interface AppMonitoringVersionTableScanStatusSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
  };
}

export default class AppMonitoringVersionTableScanStatusComponent extends Component<AppMonitoringVersionTableScanStatusSignature> {
  @service declare intl: IntlService;

  get amAppVersion() {
    return this.args.amAppVersion;
  }

  get hasComparableVersion() {
    return Boolean(this.amAppVersion?.get('comparableVersion'));
  }

  get latestFile() {
    return this.amAppVersion.get('latestFile');
  }

  get hasLatestFile() {
    return Boolean(this.latestFile?.get('id'));
  }

  get isScanned() {
    return this.hasLatestFile;
  }

  get transitionedFromUnscannedToScanned() {
    if (!this.latestFile?.get('createdOn')) {
      return false;
    }

    return dayjs(this.latestFile?.get('createdOn')).isAfter(
      this.amAppVersion.get('createdOn')
    );
  }

  get isNotScanned() {
    return this.hasComparableVersion && !this.hasLatestFile;
  }
}

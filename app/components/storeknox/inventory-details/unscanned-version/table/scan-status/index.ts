import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type SkAppVersionModel from 'irene/models/sk-app-version';

interface AppMonitoringVersionTableScanStatusSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class AppMonitoringVersionTableScanStatusComponent extends Component<AppMonitoringVersionTableScanStatusSignature> {
  @service declare intl: IntlService;

  get skAppVersion() {
    return this.args.skAppVersion;
  }

  get hasComparableVersion() {
    return Boolean(this.skAppVersion?.version);
  }

  get latestFile() {
    return this.skAppVersion.get('file');
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
      this.skAppVersion.get('createdOn')
    );
  }

  get isNotScanned() {
    return this.hasComparableVersion && !this.hasLatestFile;
  }
}

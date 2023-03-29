import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import AmAppRecordModel from 'irene/models/am-app-record';

interface AppMonitoringDetailsTableStoreVersionSignature {
  Args: {
    amAppRecord: AmAppRecordModel;
  };
}

export default class AppMonitoringDetailsTableStoreVersionComponent extends Component<AppMonitoringDetailsTableStoreVersionSignature> {
  @service declare intl: IntlService;

  get amAppVersion() {
    return this.args.amAppRecord.amAppVersion;
  }

  get hasComparableVersion() {
    return Boolean(this.amAppVersion?.get('comparableVersion'));
  }

  get hasLatestFile() {
    return Boolean(this.amAppVersion.get('latestFile')?.get('id'));
  }

  get versionStatusCondition() {
    // For scanned state
    if (this.hasComparableVersion && this.hasLatestFile) {
      return 'success';
    }

    // For not-scanned state
    if (this.hasComparableVersion && !this.hasLatestFile) {
      return 'error';
    }

    return 'default';
  }

  get versionStatusText() {
    // For scanned state
    if (this.hasComparableVersion && this.hasLatestFile) {
      return this.intl.t('scanned');
    }

    // For not-scanned state
    if (this.hasComparableVersion && !this.hasLatestFile) {
      return this.intl.t('notScanned');
    }

    return 'default';
  }
}

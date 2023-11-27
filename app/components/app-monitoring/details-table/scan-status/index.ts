import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import IntlService from 'ember-intl/services/intl';
import { AkChipColor } from 'irene/components/ak-chip';
import AmAppRecordModel from 'irene/models/am-app-record';
import AmAppVersionModel from 'irene/models/am-app-version';

interface AppMonitoringDetailsTableScanStatusSignature {
  Args: {
    storeVersionInfo: {
      version: DS.PromiseObject<AmAppVersionModel>;
      versionRecords: AmAppRecordModel[] | undefined;
    };
  };
}

export default class AppMonitoringDetailsTableScanStatusComponent extends Component<AppMonitoringDetailsTableScanStatusSignature> {
  @service declare intl: IntlService;

  get amAppVersion() {
    return this.args.storeVersionInfo.version;
  }

  get hasComparableVersion() {
    return Boolean(this.amAppVersion?.get('comparableVersion'));
  }

  get hasLatestFile() {
    return Boolean(this.amAppVersion.get('latestFile')?.get('id'));
  }

  get isScanned() {
    return this.hasComparableVersion && this.hasLatestFile;
  }

  get isNotScanned() {
    return this.hasComparableVersion && !this.hasLatestFile;
  }

  get versionStatusDetails() {
    let status: AkChipColor = 'default';
    let statusText = 'default';

    // For scanned state
    if (this.isScanned) {
      status = 'success';
      statusText = this.intl.t('scanned');
    }

    // For not-scanned state
    if (this.isNotScanned) {
      status = 'error';
      statusText = this.intl.t('notScanned');
    }

    return { statusText, status };
  }
}

import Component from '@glimmer/component';
import { service } from '@ember/service';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type SkAppVersionModel from 'irene/models/sk-app-version';

interface StoreknoxInventoryDetailsUnscannedVersionTableScanStatusSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionTableScanStatusComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionTableScanStatusSignature> {
  @service declare intl: IntlService;

  get skAppVersion() {
    return this.args.skAppVersion;
  }

  get hasVersion() {
    return Boolean(this.skAppVersion?.version);
  }

  get latestFile() {
    return this.skAppVersion.get('file');
  }

  get latestFileId() {
    return this.latestFile?.get('id');
  }

  get hasLatestFile() {
    return Boolean(this.latestFile?.get('id'));
  }

  get isScanned() {
    return this.hasLatestFile;
  }

  get transitionedFromUnscannedToScanned() {
    const latestFileCreatedOnDate = this.latestFile?.get('createdOn');

    if (!latestFileCreatedOnDate) {
      return false;
    }

    return dayjs(latestFileCreatedOnDate).isAfter(
      this.skAppVersion.get('createdOn')
    );
  }

  get isNotScanned() {
    return this.hasVersion && !this.hasLatestFile;
  }
}

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';

export interface FileDetailsDynamicScanResultsApisCapturedSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsDynamicScanResultsApisCaptured extends Component<FileDetailsDynamicScanResultsApisCapturedSignature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked showCapturedApisDownloadDrawer = false;
  @tracked fileCumulativeCapturedApisCount = 0;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanResultsApisCapturedSignature['Args']
  ) {
    super(owner, args);

    this.fetchCumulativeCapturedApisCount.perform();
  }

  get hideDownloadCapturedApisDrawer() {
    return (
      this.fileCumulativeCapturedApisCount < 0 ||
      this.fetchCumulativeCapturedApisCount.isRunning ||
      !this.showCapturedApisDownloadDrawer
    );
  }

  get hasNoCumulativeCapturedApis() {
    return this.fileCumulativeCapturedApisCount === 0;
  }

  get disableDownloadCapturedApis() {
    return (
      this.fetchCumulativeCapturedApisCount.isRunning ||
      this.hasNoCumulativeCapturedApis
    );
  }

  get capisHeaderText() {
    return this.hasNoCumulativeCapturedApis
      ? this.intl.t('apiScanModule.noUniqueApisRequestsCaptured')
      : this.intl.t('apiScanModule.uniqueApisRequestsCaptured', {
          count: this.fileCumulativeCapturedApisCount,
        });
  }

  get capisDescriptionText() {
    return this.hasNoCumulativeCapturedApis
      ? this.intl.t('apiScanModule.performDASTScanByEnablingAPI')
      : this.intl.t('apiScanModule.cumulativeDataOfDASTScan');
  }

  @action
  handleDownloadCapturedApis() {
    if (!this.fileCumulativeCapturedApisCount) {
      this.notify.error(this.intl.t('apiScanModule.noApisCaptured'));

      return;
    }

    this.showCapturedApisDownloadDrawer = true;
  }

  @action
  handleClose() {
    this.showCapturedApisDownloadDrawer = false;
  }

  fetchCumulativeCapturedApisCount = task(async () => {
    const capiReportsEndpoint = `${ENV.endpoints['files']}/${this.args.file.id}/capi_reports`;

    try {
      const response = (await this.ajax.request(
        `${capiReportsEndpoint}/total_capi_count`,
        { namespace: ENV.namespace_v2 }
      )) as { count: number };

      this.fileCumulativeCapturedApisCount = response.count;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::ApisCaptured': typeof FileDetailsDynamicScanResultsApisCaptured;
  }
}

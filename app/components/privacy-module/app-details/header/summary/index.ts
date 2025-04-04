import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import type IntlService from 'ember-intl/services/intl';

import { PrivacyStatus } from 'irene/models/privacy-project';
import type FileModel from 'irene/models/file';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface PrivacyModuleAppDetailsHeaderSummarySignature {
  Args: {
    file: FileModel;
    loading: boolean;
  };
}

export default class PrivacyModuleAppDetailsHeaderSummaryComponent extends Component<PrivacyModuleAppDetailsHeaderSummarySignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;

  @tracked showMoreFileSummary = false;
  @tracked openViewReportDrawer = false;

  get file() {
    return this.args.file;
  }

  get packageName() {
    return this.file.project.get('packageName');
  }

  get fileSummary() {
    return [
      { label: this.intl.t('version'), value: this.args.file.version },
      {
        label: capitalize(this.intl.t('versionCode')),
        value: this.args.file.versionCode,
      },
    ];
  }

  get showViewReportButton() {
    return this.privacyModule.privacyStatus === PrivacyStatus.COMPLETED;
  }

  @action
  handleFileSummaryToggle() {
    this.showMoreFileSummary = !this.showMoreFileSummary;
  }

  @action
  handleViewReportDrawerOpen() {
    this.openViewReportDrawer = true;
  }

  @action
  handleViewReportDrawerClose() {
    this.openViewReportDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Header::Summary': typeof PrivacyModuleAppDetailsHeaderSummaryComponent;
  }
}

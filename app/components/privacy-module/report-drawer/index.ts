import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';
import type PrivacyReportModel from 'irene/models/privacy-report';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface PrivacyModuleReportDrawerSignature {
  Args: {
    file?: FileModel | null;
    project?: ProjectModel | null;
    showAppDetails?: boolean;
    open?: boolean;
    onClose: () => void;
  };
}

export default class PrivacyModuleReportDrawerComponent extends Component<PrivacyModuleReportDrawerSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare privacyModule: PrivacyModuleService;

  @tracked privacyReport: PrivacyReportModel | null = null;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: PrivacyModuleReportDrawerSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchPrivacyReports.perform();
  }

  fetchPrivacyReports = task(async () => {
    try {
      this.privacyReport = await this.store.queryRecord('privacy-report', {
        fileId: this.args.file?.id,
      });

      const project = await this.privacyReport?.privacyProject;

      this.privacyModule.showPiiUpdated = project.highlight;
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::ReportDrawer': typeof PrivacyModuleReportDrawerComponent;
  }
}

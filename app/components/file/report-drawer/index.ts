import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type ConfigurationService from 'irene/services/configuration';
import type OrganizationService from 'irene/services/organization';

interface FileReportDrawerSignature {
  Args: {
    file: FileModel;
    open?: boolean;
    onClose: () => void;
  };
}

export default class FileReportDrawerComponent extends Component<FileReportDrawerSignature> {
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;
  @service declare organization: OrganizationService;

  @tracked allFileAnalysesAreLegacy = false;

  constructor(owner: unknown, args: FileReportDrawerSignature['Args']) {
    super(owner, args);

    if (this.organization.enableLegacyCvssReports) {
      this.fetchFileAnalysesCvssInfo.perform();
    }
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get reportGroupList() {
    return [
      {
        id: 'va-reports',
        title: this.intl.t('fileReport.vaReports'),
        contentComponent: 'file/report-drawer/va-reports' as const,
      },
      {
        id: 'legacy-cvss-reports',
        title: this.intl.t('fileReport.legacyCvssReports'),
        contentComponent: 'file/report-drawer/legacy-cvss-reports' as const,
        hideGroup:
          !this.organization.enableLegacyCvssReports ||
          this.allFileAnalysesAreLegacy,
      },
      {
        id: 'privacy-module-reports',
        title: this.intl.t('fileReport.privacyReport'),
        contentComponent: 'file/report-drawer/privacy-reports' as const,

        hideGroup:
          this.orgIsAnEnterprise ||
          this.organization.hideUpsellUIStatus.privacyModule,
      },
      {
        id: 'sbom-reports',
        title: this.intl.t('fileReport.sbomReports'),
        contentComponent: 'file/report-drawer/sbom-reports' as const,

        hideGroup:
          this.orgIsAnEnterprise || this.organization.hideUpsellUIStatus.sbom,
      },
      {
        id: 'store-release-readiness-reports',
        title: this.intl.t('fileReport.storeReleaseReadinessReports'),
        contentComponent:
          'file/report-drawer/store-release-readiness-reports' as const,

        hideGroup:
          !this.organization.selected?.features?.store_release_readiness,
      },
    ];
  }

  fetchFileAnalysesCvssInfo = task(async () => {
    const status = await waitForPromise(
      this.args.file.getFileAnalysesCvssInfo()
    );

    this.allFileAnalysesAreLegacy = status.all_file_analyses_are_legacy;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer': typeof FileReportDrawerComponent;
  }
}

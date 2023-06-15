import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';

import SbomFileModel, { SbomScanStatus } from 'irene/models/sbom-file';
import OrganizationService from 'irene/services/organization';
import FileModel from 'irene/models/file';

export interface FileReportDrawerSbomReportsSignature {
  Args: {
    file: FileModel;
    closeDrawer: () => void;
  };
}

export default class FileReportDrawerSbomReportsComponent extends Component<FileReportDrawerSbomReportsSignature> {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  @tracked sbomFile: SbomFileModel | null = null;

  constructor(
    owner: unknown,
    args: FileReportDrawerSbomReportsSignature['Args']
  ) {
    super(owner, args);

    if (this.sbomIsActive) {
      this.getSbomFile.perform();
    }
  }

  get file() {
    return this.args.file;
  }

  get sbomIsActive() {
    return this.organization?.selected?.features?.sbom;
  }

  get showSampleReport() {
    return !this.sbomIsActive;
  }

  get showSbomReportList() {
    return this.sbomIsActive && this.sbomFile;
  }

  get showNoSbomReportMessage() {
    return !this.showSbomReportList;
  }

  get sbomStatusIsPending() {
    if (this.sbomFile?.status) {
      return [SbomScanStatus.PENDING, SbomScanStatus.IN_PROGRESS].includes(
        this.sbomFile.status
      );
    }

    return false;
  }

  get latestFileId() {
    return this.args.file.project?.get('lastFile')?.get('id');
  }

  get currentFileIsLatestFile() {
    const currentRouteFileId =
      this.router?.currentRoute?.parent?.params['fileid'];
    return currentRouteFileId === this.latestFileId;
  }

  @action async goToLatestFile() {
    this.args.closeDrawer();
    this.router.transitionTo('authenticated.file', String(this.latestFileId));
  }

  getSbomFile = task(async () => {
    const sbFile = await this.file.sbFile;
    this.sbomFile = sbFile;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::SbomReports': typeof FileReportDrawerSbomReportsComponent;
    'file/report-drawer/sbom-reports': typeof FileReportDrawerSbomReportsComponent;
  }
}

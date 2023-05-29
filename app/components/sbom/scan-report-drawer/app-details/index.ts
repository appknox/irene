import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomScanReportDrawerAppDetailsSignature {
  Args: {
    sbomProject?: SbomProjectModel;
  };
}

export default class SbomScanReportDrawerAppDetailsComponent extends Component<SbomScanReportDrawerAppDetailsSignature> {
  get appName() {
    return this.args.sbomProject?.get('project')?.get('lastFile')?.get('name');
  }

  get appPackageName() {
    return this.args.sbomProject?.get('project')?.get('packageName');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer::AppDetails': typeof SbomScanReportDrawerAppDetailsComponent;
  }
}

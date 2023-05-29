import Component from '@glimmer/component';
import SbomAppModel from 'irene/models/sbom-app';

export interface SbomScanReportDrawerAppDetailsSignature {
  Args: {
    sbomApp?: SbomAppModel;
  };
}

export default class SbomScanReportDrawerAppDetailsComponent extends Component<SbomScanReportDrawerAppDetailsSignature> {
  get appName() {
    return this.args.sbomApp?.get('project')?.get('lastFile')?.get('name');
  }

  get appPackageName() {
    return this.args.sbomApp?.get('project')?.get('packageName');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer::AppDetails': typeof SbomScanReportDrawerAppDetailsComponent;
  }
}

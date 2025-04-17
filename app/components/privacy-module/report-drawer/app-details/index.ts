import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';

export interface PrivacyModuleReportDrawerAppDetailsSignature {
  Args: {
    file?: FileModel | null;
    project?: ProjectModel | null;
  };
}

export default class PrivacyModuleReportDrawerAppDetailsComponent extends Component<PrivacyModuleReportDrawerAppDetailsSignature> {
  get appName() {
    return this.args.file?.get('name');
  }

  get appPackageName() {
    return this.args.project?.get('packageName');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::ReportDrawer::AppDetails': typeof PrivacyModuleReportDrawerAppDetailsComponent;
  }
}

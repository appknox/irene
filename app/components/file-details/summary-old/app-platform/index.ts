import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

export interface FileDetailsSummaryOldAppPlatformSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSummaryOldAppPlatformComponent extends Component<FileDetailsSummaryOldAppPlatformSignature> {
  get platformIconClass() {
    return this.args.file.project.get('platformIconClass');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SummaryOld::AppPlatform': typeof FileDetailsSummaryOldAppPlatformComponent;
    'file-details/summary-old/app-platform': typeof FileDetailsSummaryOldAppPlatformComponent;
  }
}

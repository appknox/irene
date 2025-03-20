import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

export interface FileDetailsSummaryAppPlatformSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSummaryAppPlatformComponent extends Component<FileDetailsSummaryAppPlatformSignature> {
  get platformIconClass() {
    return this.args.file.project.get('platformIconClass');
  }

  get platformIconName() {
    if (this.platformIconClass === 'apple') {
      return 'fa-brands:apple';
    } else if (this.platformIconClass === 'android') {
      return 'android';
    }

    return '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Summary::AppPlatform': typeof FileDetailsSummaryAppPlatformComponent;
    'file-details/summary/app-platform': typeof FileDetailsSummaryAppPlatformComponent;
  }
}

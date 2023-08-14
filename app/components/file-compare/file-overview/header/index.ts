import { action } from '@ember/object';
import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

interface FileCompareFileOverviewHeaderSignature {
  Args: {
    file: FileModel | null;
    isSelectedFile?: boolean;
    disableSelection?: boolean;
    onFileSelect?: (file: FileModel | null) => void;
    hideCTAs?: boolean;
    hideOpenInNewTabIcon?: boolean;
  };
}

export default class FileCompareFileOverviewHeaderComponent extends Component<FileCompareFileOverviewHeaderSignature> {
  get packageName() {
    return this.args.file?.project.get('packageName');
  }

  @action handleFileSelect(event: Event) {
    event.stopPropagation();
    this.args.onFileSelect?.(this.args.file);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::FileOverview::Header': typeof FileCompareFileOverviewHeaderComponent;
  }
}

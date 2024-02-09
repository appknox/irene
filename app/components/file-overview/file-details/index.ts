import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

interface FileOverviewFileDetailsSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
  };
}

export default class FileOverviewFileDetailsComponent extends Component<FileOverviewFileDetailsSignature> {
  get hasVersion() {
    return typeof this.args.file?.version !== 'undefined';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileOverview::FileDetails': typeof FileOverviewFileDetailsComponent;
  }
}

import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

interface FileCompareFileOverviewFileDetailsSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
  };
}

export default class FileCompareFileOverviewFileDetailsComponent extends Component<FileCompareFileOverviewFileDetailsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::FileOverview::FileDetails': typeof FileCompareFileOverviewFileDetailsComponent;
  }
}

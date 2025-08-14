import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

interface FileCompareFileOverviewSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    isSelectedFile?: boolean;
    disableSelection?: boolean;
    onFileSelect?: (file: FileModel | null) => void;
    hideCTAs?: boolean;
    hideOpenInNewTabIcon?: boolean;
    showMenuButton?: boolean;
  };
  Blocks: {
    default: [];
  };
}

export default class FileCompareFileOverviewComponent extends Component<FileCompareFileOverviewSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileOverview: typeof FileCompareFileOverviewComponent;
  }
}

import Component from '@glimmer/component';

interface FileCompareLoaderSignature {
  Element: HTMLElement;
  Args: {
    loadingText?: string;
  };
}

export default class FileCompareLoaderComponent extends Component<FileCompareLoaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::Loader': typeof FileCompareLoaderComponent;
  }
}

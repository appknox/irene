import Component from '@glimmer/component';

interface FileCompareEmptySignature {
  Element: HTMLElement;
  Args: {
    header?: string;
    body?: string;
  };
}

export default class FileCompareEmptyComponent extends Component<FileCompareEmptySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::Empty': typeof FileCompareEmptyComponent;
  }
}

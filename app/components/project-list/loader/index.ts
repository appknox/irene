import Component from '@glimmer/component';

interface ProjectListLoaderSignature {
  Element: HTMLElement;
  Args: {
    loadingText?: string;
  };
}

export default class FileCompareLoaderComponent extends Component<ProjectListLoaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::Loader': typeof FileCompareLoaderComponent;
  }
}

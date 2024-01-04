import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

interface FileOverviewTagsSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
  };
}

export default class FileOverviewTagsComponent extends Component<FileOverviewTagsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileOverview::Tags': typeof FileOverviewTagsComponent;
  }
}

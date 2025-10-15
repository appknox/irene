import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';

export interface FileDetailsSignature {
  Args: { file: FileModel };
}

export default class FileDetailsComponent extends Component<FileDetailsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileDetails: typeof FileDetailsComponent;
  }
}

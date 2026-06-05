import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';
import type { FileDetailsAnalysesProviderContext } from './analyses-provider';

export interface FileDetailsSignature {
  Args: {
    file: FileModel;
    fileAnalysesListContext: FileDetailsAnalysesProviderContext;
  };
}

export default class FileDetailsComponent extends Component<FileDetailsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileDetails: typeof FileDetailsComponent;
  }
}

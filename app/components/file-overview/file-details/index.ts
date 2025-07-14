import Component from '@glimmer/component';
import { action } from '@ember/object';

import type FileModel from 'irene/models/file';

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

  get platformIconClass() {
    return this.args.file?.project.get('platformIconClass');
  }

  @action
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileOverview::FileDetails': typeof FileOverviewFileDetailsComponent;
  }
}

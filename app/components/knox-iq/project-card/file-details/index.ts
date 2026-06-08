import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';

interface KnoxIqProjectCardFileDetailsSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    project?: ProjectModel | null;
  };
}

export default class KnoxIqProjectCardFileDetailsComponent extends Component<KnoxIqProjectCardFileDetailsSignature> {
  get hasVersion() {
    return this.args.file?.version !== undefined;
  }

  get platformIconClass() {
    return this.args.project?.platformIconClass;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::ProjectCard::FileDetails': typeof KnoxIqProjectCardFileDetailsComponent;
  }
}

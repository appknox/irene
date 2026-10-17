import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import type FileModel from 'irene/models/file';

export interface FileDetailsOverdueVulnerabilitiesSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsOverdueVulnerabilitiesComponent extends Component<FileDetailsOverdueVulnerabilitiesSignature> {
  @tracked overdueCount = 0;

  constructor(
    owner: unknown,
    args: FileDetailsOverdueVulnerabilitiesSignature['Args']
  ) {
    super(owner, args);

    this.fetchOverdueCount.perform();
  }

  get hasOverdueVulnerabilities() {
    return this.overdueCount > 0;
  }

  fetchOverdueCount = task(async () => {
    try {
      const project = await this.args.file.project;

      if (!project) {
        return;
      }

      const { count } = await project.getOverdueVulnerabilitiesCount();

      this.overdueCount = count;
    } catch {
      // The banner is advisory; a failed count leaves it hidden instead of blocking the page
      this.overdueCount = 0;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::OverdueVulnerabilities': typeof FileDetailsOverdueVulnerabilitiesComponent;
  }
}

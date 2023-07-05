import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import FileModel from 'irene/models/file';

export interface FileDetailsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsComponent extends Component<FileDetailsSignature> {
  @service declare intl: IntlService;

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.args.file.id,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileDetails: typeof FileDetailsComponent;
  }
}

import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import FileModel from 'irene/models/file';

interface FileOverviewFileDetailsSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
  };
}

export default class FileOverviewFileDetailsComponent extends Component<FileOverviewFileDetailsSignature> {
  @service declare intl: IntlService;

  get versionCode() {
    return capitalize(this.intl.t('versionCode'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileOverview::FileDetails': typeof FileOverviewFileDetailsComponent;
  }
}

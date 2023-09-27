import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import FileModel from 'irene/models/file';

interface FileCompareFileOverviewFileDetailsSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
  };
}

export default class FileCompareFileOverviewFileDetailsComponent extends Component<FileCompareFileOverviewFileDetailsSignature> {
  @service declare intl: IntlService;

  get versionCode() {
    return capitalize(this.intl.t('versionCode'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::FileOverview::FileDetails': typeof FileCompareFileOverviewFileDetailsComponent;
  }
}

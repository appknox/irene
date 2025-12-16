import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

interface FileCompareInvalidCompareSignature {
  Args: {
    isSameFile?: boolean;
  };
}

export default class FileCompareInvalidCompareComponent extends Component<FileCompareInvalidCompareSignature> {
  @service declare intl: IntlService;

  get invalidCompareText() {
    return this.args.isSameFile
      ? this.intl.t('fileCompare.sameFilesWarningSubText')
      : this.intl.t('fileCompare.differentProjectsWarningSubText');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::InvalidCompare': typeof FileCompareInvalidCompareComponent;
  }
}

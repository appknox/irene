import Component from '@glimmer/component';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

export interface FileDetailsDynamicScanNavigationGraphInvalidFileOrDsGraphSignature {
  Element: HTMLElement;
  Args: {
    fileId?: string;
    isFileValid?: boolean;
  };
}

export default class FileDetailsDynamicScanNavigationGraphInvalidFileOrDsGraphComponent extends Component<FileDetailsDynamicScanNavigationGraphInvalidFileOrDsGraphSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;

  get fileId() {
    return this.args.fileId;
  }

  get isFileValid() {
    return this.args.isFileValid;
  }

  get notFoundTitle() {
    return this.intl.t('navigationGraph.notFoundTitle');
  }

  get notFoundDescription() {
    if (this.isFileValid) {
      return this.intl.t('navigationGraph.notFoundInvalidDynamicScan');
    }

    return this.intl.t('navigationGraph.notFoundInvalidFile');
  }

  get backButtonRoute() {
    return this.isFileValid && this.fileId
      ? 'authenticated.dashboard.file'
      : 'authenticated.home';
  }

  get backButtonModel() {
    return this.isFileValid && this.fileId ? this.fileId : undefined;
  }

  get backButtonText() {
    return this.isFileValid && this.fileId
      ? this.intl.t('navigationGraph.backToFileDetails')
      : this.intl.t('gotoHome');
  }

  get isErrorSubstate() {
    return this.args.isFileValid !== undefined;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph::InvalidFileOrDsGraph': typeof FileDetailsDynamicScanNavigationGraphInvalidFileOrDsGraphComponent;
  }
}

import Component from '@glimmer/component';

export interface FileDetailsDynamicScanNavigationGraphNotFoundSignature {
  Element: HTMLElement;
  Args: {
    title: string;
    description: string;
    buttonText: string;
    buttonRoute: string;
    buttonModel?: string;
    showBreadcrumbs?: boolean;
  };
}

export default class FileDetailsDynamicScanNavigationGraphNotFoundComponent extends Component<FileDetailsDynamicScanNavigationGraphNotFoundSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph::NotFound': typeof FileDetailsDynamicScanNavigationGraphNotFoundComponent;
  }
}

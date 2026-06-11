import Component from '@glimmer/component';
import type { NavigationGraphLayoutOption } from '../graph-config';

export interface FileDetailsDynamicScanNavigationGraphNavPanelSignature {
  Element: HTMLElement;
  Args: {
    variantCount: number;
    transitionCount: number;
    layoutOptions: NavigationGraphLayoutOption[];
    selectedLayoutOption?: NavigationGraphLayoutOption;
    onLayoutChange: (option: NavigationGraphLayoutOption) => void;
  };
}

export default class FileDetailsDynamicScanNavigationGraphNavPanelComponent extends Component<FileDetailsDynamicScanNavigationGraphNavPanelSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph::NavPanel': typeof FileDetailsDynamicScanNavigationGraphNavPanelComponent;
  }
}

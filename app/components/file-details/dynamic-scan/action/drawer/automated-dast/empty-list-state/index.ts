import Component from '@glimmer/component';

export interface FileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateSignature {
  Element: HTMLElement;
  Args: {
    headerText: string;
    subText: string;
    projectId?: string;
    link?: string;
    linkText?: string;
  };
}

export default class FileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateComponent extends Component<FileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::AutomatedDast::EmptyListState': typeof FileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateComponent;
  }
}

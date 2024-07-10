import Component from '@glimmer/component';

export interface FileDetailsFileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateSignature {
  Element: HTMLElement;
  Args: {
    headerText: string;
    subText: string;
  };
}

export default class FileDetailsFileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateComponent extends Component<FileDetailsFileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::AutomatedDast::EmptyListState': typeof FileDetailsFileDetailsDynamicScanActionDrawerAutomatedDastEmptyListStateComponent;
  }
}

import Component from '@glimmer/component';

export default class FileDetailsFileDetailsDynamicScanActionDrawerAutomatedDastLoadingComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::AutomatedDast::Loading': typeof FileDetailsFileDetailsDynamicScanActionDrawerAutomatedDastLoadingComponent;
  }
}

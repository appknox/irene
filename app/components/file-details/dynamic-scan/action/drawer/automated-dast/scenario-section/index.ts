import Component from '@glimmer/component';

import type ScenarioModel from 'irene/models/scenario';
import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';

type ScenarioSectionItem = ScenarioModel | ScanParameterGroupModel;

export interface FileDetailsDynamicScanActionDrawerAutomatedDastScenarioSectionSignature {
  Element: HTMLElement;
  Args: {
    title: string;
    projectId?: string;
    scenarios: ScenarioSectionItem[];
    isLoading?: boolean;
    isEmpty?: boolean;
    showSuperUserLabel?: boolean;
  };
}

export default class FileDetailsDynamicScanActionDrawerAutomatedDastScenarioSectionComponent extends Component<FileDetailsDynamicScanActionDrawerAutomatedDastScenarioSectionSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::AutomatedDast::ScenarioSection': typeof FileDetailsDynamicScanActionDrawerAutomatedDastScenarioSectionComponent;
  }
}

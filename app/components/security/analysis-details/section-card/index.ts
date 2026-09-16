import Component from '@glimmer/component';

export interface SecurityAnalysisDetailsSectionCardSignature {
  Element: HTMLElement;
  Args: {
    title: string;
    description?: string;
    testId?: string;
  };
  Blocks: {
    actions: [];
    content: [];
  };
}

export default class SecurityAnalysisDetailsSectionCardComponent extends Component<SecurityAnalysisDetailsSectionCardSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::SectionCard': typeof SecurityAnalysisDetailsSectionCardComponent;
  }
}

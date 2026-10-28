import Component from '@glimmer/component';

export type NewAssessmentStepState = 'done' | 'current' | 'upcoming';

export interface OffensiveSecurityNewAssessmentStepSignature {
  Element: HTMLLIElement;
  Args: {
    number: number;
    state: NewAssessmentStepState;
    isLast?: boolean;
  };
  Blocks: { default: [] };
}

export default class OffensiveSecurityNewAssessmentStepComponent extends Component<OffensiveSecurityNewAssessmentStepSignature> {
  get isDone(): boolean {
    return this.args.state === 'done';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::NewAssessment::Step': typeof OffensiveSecurityNewAssessmentStepComponent;
  }
}

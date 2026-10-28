import Component from '@glimmer/component';

export type NewAssessmentSummaryItemState =
  | 'done'
  | 'active'
  | 'locked'
  | 'optional';

export interface OffensiveSecurityNewAssessmentSummaryItemSignature {
  Element: HTMLLIElement;
  Args: {
    state: NewAssessmentSummaryItemState;
    label: string;
    value?: string;
    sub?: string;
  };
  Blocks: { chip: [] };
}

export default class OffensiveSecurityNewAssessmentSummaryItemComponent extends Component<OffensiveSecurityNewAssessmentSummaryItemSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::NewAssessment::Summary::Item': typeof OffensiveSecurityNewAssessmentSummaryItemComponent;
  }
}

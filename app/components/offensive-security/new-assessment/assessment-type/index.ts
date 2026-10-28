import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type OffsecNewAssessmentService from 'irene/services/offsec-new-assessment';
import type { AssessmentType } from 'irene/services/offsec-new-assessment';

export default class OffensiveSecurityNewAssessmentAssessmentTypeComponent extends Component {
  @service declare offsecNewAssessment: OffsecNewAssessmentService;

  get isComprehensive(): boolean {
    return this.offsecNewAssessment.assessmentType === 'comprehensive';
  }

  get isResilience(): boolean {
    return this.offsecNewAssessment.assessmentType === 'resilience';
  }

  @action
  selectAssessmentType(type: AssessmentType) {
    this.offsecNewAssessment.setAssessmentType(type);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::NewAssessment::AssessmentType': typeof OffensiveSecurityNewAssessmentAssessmentTypeComponent;
  }
}

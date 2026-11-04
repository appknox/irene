import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { MAX_CREDENTIALS } from 'irene/services/offsec-new-assessment';
import type OffsecNewAssessmentService from 'irene/services/offsec-new-assessment';

export default class OffensiveSecurityNewAssessmentCredentialsComponent extends Component {
  @service declare offsecNewAssessment: OffsecNewAssessmentService;

  maxCredentials = MAX_CREDENTIALS;

  get credentials() {
    return this.offsecNewAssessment.credentials;
  }

  get hasCredentials() {
    return this.credentials.length > 0;
  }

  get canAddCredential() {
    return this.credentials.length < MAX_CREDENTIALS;
  }

  @action
  updateCredential(
    index: number,
    field: 'role' | 'username' | 'password',
    event: Event
  ) {
    const target = event.target as HTMLInputElement;
    this.offsecNewAssessment.updateCredential(index, field, target.value);
  }

  @action
  toggleShowPassword(index: number) {
    this.offsecNewAssessment.toggleShowPassword(index);
  }

  @action
  addCredential() {
    this.offsecNewAssessment.addCredential();
  }

  @action
  removeCredential(index: number) {
    this.offsecNewAssessment.removeCredential(index);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::NewAssessment::Credentials': typeof OffensiveSecurityNewAssessmentCredentialsComponent;
  }
}

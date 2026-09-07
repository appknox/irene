import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type MeService from 'irene/services/me';
import type OrganizationMemberModel from 'irene/models/organization-member';

interface OrganizationMemberInfoSignature {
  Args: {
    member: OrganizationMemberModel;
  };
  Element: HTMLElement;
}

export default class OrganizationMemberInfoComponent extends Component<OrganizationMemberInfoSignature> {
  @service declare me: MeService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationMemberInfo: typeof OrganizationMemberInfoComponent;
  }
}

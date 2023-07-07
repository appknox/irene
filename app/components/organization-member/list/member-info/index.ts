import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';
import OrganizationModel from 'irene/models/organization';
import OrganizationMemberModel from 'irene/models/organization-member';

interface OrganizationMemberInfoSignature {
  Args: {
    organization: OrganizationModel;
    member: OrganizationMemberModel;
  };
  Element: HTMLElement;
}

export default class OrganizationMemberInfoComponent extends Component<OrganizationMemberInfoSignature> {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationMemberInfo: typeof OrganizationMemberInfoComponent;
  }
}

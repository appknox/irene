import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';
import OrganizationModel from 'irene/models/organization';
import OrganizationMemberModel from 'irene/models/organization-member';
import { OrganizationMembersRouteQueryParams } from 'irene/routes/authenticated/dashboard/organization/users';

interface OrganizationMemberSignature {
  Args: {
    member: OrganizationMemberModel;
    organization: OrganizationModel;
    queryParams: OrganizationMembersRouteQueryParams;
  };
  Element: HTMLElement;
}

export default class OrganizationMemberComponent extends Component<OrganizationMemberSignature> {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationMember: typeof OrganizationMemberComponent;
  }
}

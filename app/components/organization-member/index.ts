import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationMemberModel from 'irene/models/organization-member';
import type { OrganizationMembersRouteQueryParams } from 'irene/routes/authenticated/dashboard/organization/users';

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

import Model, { attr, hasMany, AsyncHasMany } from '@ember-data/model';

import OrganizationMemberModel from './organization-member';
import OrganizationNamespaceModel from './organization-namespace';
import OrganizationProjectModel from './organization-project';
import OrganizationTeamModel from './organization-team';

export default class OrganizationModel extends Model {
  @attr('string')
  declare name: string;

  @attr('string')
  declare logo: string;

  @attr('boolean')
  declare billingHidden: boolean;

  @attr('boolean')
  declare isTrial: boolean;

  @attr('boolean')
  declare mandatoryMfa: boolean;

  @hasMany('organization-member')
  declare members: AsyncHasMany<OrganizationMemberModel>;

  @hasMany('organization-namespace')
  declare namespaces: AsyncHasMany<OrganizationNamespaceModel>;

  @hasMany('organization-project')
  declare projects: AsyncHasMany<OrganizationProjectModel>;

  @hasMany('organization-team')
  declare teams: AsyncHasMany<OrganizationTeamModel>;

  @attr()
  declare features: unknown;

  @attr('number')
  declare projectsCount: number;

  @attr('number')
  declare namespacesCount: number;

  @attr('number')
  declare teamsCount: number;

  get showBilling() {
    return !this.billingHidden;
  }

  get membersCount(): number | undefined {
    // TODO: remove this getter if not used
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.members?.meta?.count;
  }

  async get_am_configuration() {
    const adapter = this.store.adapterFor('amconfiguration');
    const payload = await adapter.from_organization(this.id);

    const normalized = this.store.normalize('amconfiguration', payload);
    return this.store.push(normalized);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    organization: OrganizationModel;
  }
}

import Model, { attr, hasMany, AsyncHasMany } from '@ember-data/model';
import OrganizationMemberModel from './organization-member';
import OrganizationNamespaceModel from './organization-namespace';
import OrganizationProjectModel from './organization-project';
import OrganizationTeamModel from './organization-team';

interface Features {
  app_monitoring: boolean;
  dynamicscan_automation: boolean;
  manualscan: boolean;
  partner_dashboard: boolean;
  sso: boolean;
  sbom: boolean;
  public_apis: boolean;
  storeknox: boolean;
  privacy: boolean;
  upload_via_url: boolean;
}

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

  @hasMany('organization-member', { async: true, inverse: null })
  declare members: AsyncHasMany<OrganizationMemberModel>;

  @hasMany('organization-namespace', { async: true, inverse: null })
  declare namespaces: AsyncHasMany<OrganizationNamespaceModel>;

  @hasMany('organization-project', { async: true, inverse: null })
  declare projects: AsyncHasMany<OrganizationProjectModel>;

  @hasMany('organization-team', { async: true, inverse: null })
  declare teams: AsyncHasMany<OrganizationTeamModel>;

  @attr()
  declare features: Features;

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
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    organization: OrganizationModel;
  }
}

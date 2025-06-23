import Model, {
  type AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';

import type SkOrganizationMembershipModel from './sk-organization-membership';
import type OrganizationModel from './organization';

export type SkOrganizationModelName = 'sk-organization';

export default class SkOrganizationModel extends Model {
  private modelName = SkOrganizationModel.modelName as SkOrganizationModelName;

  @attr('string')
  declare createdOn: string;

  @attr('string')
  declare updatedOn: string;

  @attr('boolean')
  declare addAppknoxProjectToInventoryByDefault: boolean;

  @attr('boolean')
  declare autodiscoveryOnboardingDone: boolean;

  @attr('boolean')
  declare autoDiscoveryEnabled: boolean;

  @belongsTo('organization', { async: false, inverse: null })
  declare organization: OrganizationModel;

  @hasMany('sk-organization-membership', {
    async: true,
    inverse: 'skOrganization',
  })
  declare members: AsyncHasMany<SkOrganizationMembershipModel>;

  async toggleEvent(key: string, autoDiscoveryEnabled: boolean) {
    const adapter = this.store.adapterFor('sk-organization');

    return await adapter.toggleOrganizationSetting(
      this.modelName,
      this.id,
      key,
      autoDiscoveryEnabled
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-organization': SkOrganizationModel;
  }
}

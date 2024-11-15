import Model, {
  attr,
  belongsTo,
  hasMany,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';

import type ServiceAccountProjectModel from './service-account-project';
import type OrganizationUserModel from './organization-user';

export enum ServiceAccountType {
  USER = 1,
  SYSTEM = 2,
}

export default class ServiceAccountModel extends Model {
  @attr('boolean')
  declare scopePublicApiUserRead: boolean;

  @attr('boolean')
  declare scopePublicApiProjectRead: boolean;

  @attr('boolean')
  declare scopePublicApiScanResultVa: boolean;

  @attr('boolean')
  declare isExpired: boolean;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare allProjects: boolean;

  @hasMany('service-account-project', { async: true, inverse: null })
  declare projects: AsyncHasMany<ServiceAccountProjectModel>;

  @attr('date')
  declare expiry: Date | null;

  @attr('string')
  declare name: string;

  @attr('string')
  declare description: string;

  @attr('string')
  declare accessKeyId: string;

  @attr('string')
  declare secretAccessKey: string;

  @attr('number')
  declare serviceAccountType: ServiceAccountType;

  @attr('date')
  declare updatedOn: Date;

  @attr('date')
  declare createdOn: Date;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare updatedByUser: AsyncBelongsTo<OrganizationUserModel> | null;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare createdByUser: AsyncBelongsTo<OrganizationUserModel>;

  async resetKey(expiry: Date | null) {
    const adapter = this.store.adapterFor('service-account');

    return await adapter.resetKey('service-account', this.id, expiry);
  }

  async addProject(projectId: number) {
    const adapter = this.store.adapterFor('service-account');

    return await adapter.addProject('service-account', this.id, projectId);
  }

  updateValues<K extends keyof ServiceAccountModel>(
    payload: Pick<ServiceAccountModel, K>
  ) {
    const normalized = this.store.normalize(ServiceAccountModel.modelName, {
      ...payload,
      id: this.id,
    });

    this.store.push(normalized);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'service-account': ServiceAccountModel;
  }
}

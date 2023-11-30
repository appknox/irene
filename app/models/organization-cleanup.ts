import Model, { belongsTo, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import OrganizationUserModel from 'irene/models/organization-user';

export default class OrganizationCleanupModel extends Model {
  @service declare intl: IntlService;

  @belongsTo('organization-user')
  declare user: OrganizationUserModel;

  @attr('date')
  declare createdOn: Date;

  @attr()
  declare projects: unknown;

  @attr('string')
  declare type: string;

  get isManual(): boolean {
    return this.type === 'Manual';
  }

  get typeValue(): string {
    return this.intl.t(this.type.toLowerCase());
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-cleanup': OrganizationCleanupModel;
  }
}

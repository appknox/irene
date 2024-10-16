/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

import OrganizationModel from './organization';
import OrganizationUserModel from './organization-user';

export default class OrganizationNamespaceModel extends Model {
  @attr('string')
  declare value: string;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare approvedOn: Date;

  @attr('boolean')
  declare isApproved: boolean;

  @belongsTo('organization', { async: true, inverse: null })
  declare organization: AsyncBelongsTo<OrganizationModel>;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare requestedBy: AsyncBelongsTo<OrganizationUserModel>;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare approvedBy: AsyncBelongsTo<OrganizationUserModel>;

  @attr('number')
  declare platform: number;

  @computed('platform')
  get platformIconClass() {
    switch (this.platform) {
      case ENUMS.PLATFORM.ANDROID:
        return 'android';
      case ENUMS.PLATFORM.IOS:
        return 'apple';
      case ENUMS.PLATFORM.WINDOWS:
        return 'windows';
      default:
        return 'mobile';
    }
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-namespace': OrganizationNamespaceModel;
  }
}

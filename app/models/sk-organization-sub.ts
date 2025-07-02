import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import type SkOrganizationModel from './sk-organization';
import dayjs from 'dayjs';

export default class SkOrganizationSubModel extends Model {
  @attr('boolean')
  declare isTrial: boolean;

  @attr('string')
  declare endDate: string;

  @attr('number')
  declare licensesProcured: number;

  @attr('number')
  declare licensesRemaining: number;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare isLicenseTrackingApplicable: boolean;

  @attr('number')
  declare updatedBy: number;

  @attr('number')
  declare createdBy: number;

  @belongsTo('sk-organization', { async: true, inverse: null })
  declare skOrganization: AsyncBelongsTo<SkOrganizationModel>;

  get orgSubIsExpired() {
    return dayjs(new Date()).isAfter(this.endDate);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-organization-sub': SkOrganizationSubModel;
  }
}

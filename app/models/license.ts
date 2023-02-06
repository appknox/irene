/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class LicenseModel extends Model {
  @attr('string')
  declare key: string;

  @attr('date')
  declare startDate: Date;

  @attr('date')
  declare expiryDate: Date;

  @attr('string')
  declare name: string;

  @attr('string')
  declare email: string;

  @attr('boolean')
  declare isLimitedScans: boolean;

  @attr('string')
  declare status: string;

  @attr('string')
  declare perAppId: string;

  @attr('string')
  declare perAppName: string;

  @attr('string')
  declare perAppDescription: string;

  @attr('number')
  declare perAppQuantity: number;

  @attr('string')
  declare perScanId: string;

  @attr('string')
  declare perScanName: string;

  @attr('string')
  declare perScanDescription: string;

  @attr('number')
  declare perScanQuantity: number;

  @computed('status')
  get isActive() {
    return this.status === 'Active';
  }

  @computed('status')
  get isExpired() {
    return this.status === 'Expired';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    license: LicenseModel;
  }
}

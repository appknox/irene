import Model, { attr } from '@ember-data/model';
import dayjs from 'dayjs';

export default class OrganizationCyodRegisteredDeviceModel extends Model {
  @attr('string')
  declare name: string | null;

  @attr('string')
  declare serialNumber: string;

  @attr('string')
  declare model: string;

  @attr('number')
  declare platform: number;

  @attr('boolean')
  declare isConnected: boolean;

  @attr('string')
  declare createdOn: string | null;

  get deviceName() {
    return this.name || this.model || this.serialNumber;
  }

  get registeredOn() {
    return this.createdOn ? dayjs(this.createdOn).format('D MMMM YYYY') : '-';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-cyod-registered-device': OrganizationCyodRegisteredDeviceModel;
  }
}

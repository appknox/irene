import Model, { attr } from '@ember-data/model';

export default class ProjectAvailableDeviceModel extends Model {
  @attr('string')
  declare address: string;

  @attr('string')
  declare deviceIdentifier: string;

  @attr('string')
  declare cpuArchitecture: string;

  @attr('string')
  declare model: string;

  @attr('string')
  declare platformVersion: string;

  @attr('string')
  declare simNetwork: string;

  @attr('string')
  declare simPhoneNumber: string;

  @attr('string')
  declare state: string;

  @attr('string')
  declare vpnPackageName: string;

  @attr('boolean')
  declare hasPinLock: boolean;

  @attr('boolean')
  declare hasPersistentApps: boolean;

  @attr('boolean')
  declare hasSim: boolean;

  @attr('boolean')
  declare hasVnc: boolean;

  @attr('boolean')
  declare hasVpn: boolean;

  @attr('boolean')
  declare isTablet: boolean;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare isConnected: boolean;

  @attr('boolean')
  declare isReserved: boolean;

  @attr('number')
  declare platform: number;

  @attr
  declare persistentApps: string[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'project-available-device': ProjectAvailableDeviceModel;
  }
}

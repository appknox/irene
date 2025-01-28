import Model, { attr } from '@ember-data/model';

export default class DeviceModel extends Model {
  @attr('string')
  declare state: string;

  @attr('string')
  declare deviceIdentifier: string;

  @attr('string', { defaultValue: null })
  declare customIdentifier: string | null;

  @attr('string')
  declare address: string;

  @attr('boolean')
  declare isConnected: boolean;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare isTablet: boolean;

  @attr('boolean')
  declare isReserved: boolean;

  @attr('number')
  declare platform: number;

  @attr('string')
  declare platformVersion: string;

  @attr('string')
  declare cpuArchitecture: string;

  @attr('string')
  declare model: string;

  @attr('boolean')
  declare hasSim: boolean;

  @attr('string')
  declare simNetwork: string;

  @attr('string')
  declare simPhoneNumber: string;

  @attr('boolean')
  declare hasPinLock: boolean;

  @attr('boolean')
  declare hasVpn: boolean;

  @attr('string')
  declare vpnPackageName: string;

  @attr('boolean')
  declare hasPersistentApps: boolean;

  @attr()
  declare persistentApps: unknown[];

  @attr('boolean')
  declare hasVnc: boolean;

  @attr('string')
  declare extraCapabilities: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    device: DeviceModel;
  }
}

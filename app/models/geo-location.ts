import Model, { attr } from '@ember-data/model';

export interface HostUrl {
  ip: string;
  cidr: string;
  domain: string;
  source: string;
  source_location: string[];
}

export default class GeoLocationModel extends Model {
  @attr('boolean')
  declare isHighRiskRegion: boolean;

  @attr('string')
  declare countryCode: string;

  @attr('string')
  declare countryName: string;

  @attr()
  declare hostUrls: HostUrl[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'geo-location': GeoLocationModel;
  }
}

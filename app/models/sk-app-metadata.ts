import Model, { attr } from '@ember-data/model';
import Inflector from 'ember-inflector';

const inflector = Inflector.inflector;
inflector.irregular('sk-app-metadata', 'sk-app-metadata');

export interface Region {
  id: number;
  skStore: number;
  countryCode: string;
  icon: string;
}

export default class SkAppMetadataModel extends Model {
  @attr('string')
  declare docUlid: string;

  @attr('string')
  declare docHash: string;

  @attr('string')
  declare appId: string;

  @attr('string')
  declare url: string;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare packageName: string;

  @attr('string')
  declare title: string;

  @attr()
  declare region: Region;

  @attr('number')
  declare platform: number;

  @attr('string')
  declare platformDisplay: string;

  @attr('string')
  declare devName: string;

  @attr('string')
  declare devEmail: string;

  @attr('string')
  declare devWebsite: string;

  @attr('string')
  declare devId: string;

  @attr('number')
  declare rating: number;

  @attr('number')
  declare ratingCount: number;

  @attr('number')
  declare reviewCount: number;

  @attr('number')
  declare totalDownloads: number;

  @attr('date')
  declare uploadDate: Date;

  @attr('date')
  declare latestUploadDate: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-app-metadata': SkAppMetadataModel;
  }
}

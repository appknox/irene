import commondrf from './commondrf';

export default class ManualScan extends commondrf {}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    manualscan: ManualScan;
  }
}

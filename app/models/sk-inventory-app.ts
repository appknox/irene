import SkAppModel from './sk-app';

export default class SkInventoryAppModel extends SkAppModel {}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-inventory-app': SkInventoryAppModel;
  }
}

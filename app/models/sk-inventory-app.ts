import { belongsTo } from '@ember-data/model';
import SkAppModel from './sk-app';
import type SkInventoryAppProjectModel from './sk-inventory-app-project';

export default class SkInventoryAppModel extends SkAppModel {
  @belongsTo('sk-inventory-app-project', { async: false, inverse: null })
  declare coreProject: SkInventoryAppProjectModel | null;

  get appIsNotAvailableOnAppknox() {
    return this.coreProject === null;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-inventory-app': SkInventoryAppModel;
  }
}

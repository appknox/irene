import { belongsTo } from '@ember-data/model';
import ProjectModel from './project';
import type SkInventoryAppFileModel from './sk-inventory-app-file';

export default class SkInventoryAppProjectModel extends ProjectModel {
  @belongsTo('sk-inventory-app-file', { async: false, inverse: null })
  declare latestVersion: SkInventoryAppFileModel;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-inventory-app-project': SkInventoryAppProjectModel;
  }
}

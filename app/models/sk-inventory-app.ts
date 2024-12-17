import { belongsTo } from '@ember-data/model';
import SkAppModel from './sk-app';
import type ProjectModel from './project';
import type FileModel from './file';

export default class SkInventoryAppModel extends SkAppModel {
  @belongsTo('project', { async: true, inverse: null })
  declare coreProject: ProjectModel | null;

  @belongsTo('file', { async: true, inverse: null })
  declare coreProjectLatestVersion: FileModel | null;

  get appIsNotAvailableOnAppknox() {
    return !this.coreProject?.id;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-inventory-app': SkInventoryAppModel;
  }
}

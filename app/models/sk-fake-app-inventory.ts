import SkAppModel from './sk-app';

export default class SkFakeAppInventoryModel extends SkAppModel {}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-fake-app-inventory': SkFakeAppInventoryModel;
  }
}

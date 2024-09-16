import { attr } from '@ember-data/model';

import SkAppModel from './sk-app';

export default class SkRequestedAppModel extends SkAppModel {
  @attr('string')
  declare approvedBy: string;

  @attr('string')
  declare rejectedBy: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-requested-app': SkRequestedAppModel;
  }
}

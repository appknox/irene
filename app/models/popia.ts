import Model, { attr } from '@ember-data/model';
import { irregular } from '@ember-data/request-utils/string';

irregular('popia', 'popias');

export default class PopiaModel extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare title: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    popia: PopiaModel;
  }
}

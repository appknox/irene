/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class PersonaltokenModel extends Model {
  @attr('string')
  declare key: string;

  @attr('string')
  declare name: string;

  @attr('date')
  declare created: Date;

  @computed('created')
  get createdDateOnHumanized() {
    return this.created.toLocaleDateString();
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    personaltoken: PersonaltokenModel;
  }
}

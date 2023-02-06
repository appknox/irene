/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class PricingModel extends Model {
  @attr('string')
  declare name: string;

  @attr('string')
  declare description: string;

  @attr('number')
  declare price: number;

  @attr('number')
  declare projectsLimit: number;

  @computed('description')
  get descriptionItems() {
    return this.description != null ? this.description.split(',') : undefined;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    pricing: PricingModel;
  }
}

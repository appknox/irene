/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class PlanModel extends Model {
  @attr('string')
  declare planId: string;

  @attr('string')
  declare name: string;

  @attr('string')
  declare description: string;

  @attr('number')
  declare price: number;

  @attr('number')
  declare projectsLimit: number;

  @attr('string')
  declare monthlyUrl: string;

  @attr('string')
  declare quarterlyUrl: string;

  @attr('string')
  declare halfYearlyUrl: string;

  @attr('string')
  declare yearlyUrl: string;

  @attr('string')
  declare monthlyPrice: string;

  @attr('string')
  declare quarterlyPrice: string;

  @attr('string')
  declare halfYearlyPrice: string;

  @attr('string')
  declare yearlyPrice: string;

  @computed('description')
  get descriptionItems() {
    return this.description != null ? this.description.split(',') : undefined;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    plan: PlanModel;
  }
}

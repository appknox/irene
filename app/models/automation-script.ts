/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import ComputedProperty from '@ember/object/computed';

export default class AutomationScriptModel extends Model {
  @attr('string')
  declare fileName: string;

  @attr('string')
  declare fileKey: string;

  @attr('number')
  declare profile: number;

  @attr('date')
  declare createdOn: Date;

  @attr('boolean', { allowNull: true })
  declare isValid: ComputedProperty<boolean>; // this should be boolean but cannot override parent class property type
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'automation-script': AutomationScriptModel;
  }
}

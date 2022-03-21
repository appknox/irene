/* eslint-disable ember/no-computed-properties-in-native-classes, prettier/prettier */
import { computed } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class OrganizationCleanupModel extends Model {

  @service intl;

  @belongsTo('organization-user') user;
  @attr('date') createdOn;
  @attr() projects;
  @attr('string') type;
  @computed('type')
  get isManual() {
    return this.type === 'Manual';
  }
  get typeValue() {
    return this.intl.t(this.type.toLowerCase());
  }
}

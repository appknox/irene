import { computed } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class OrganizationCleanupModel extends Model {

  @service intl;

  @belongsTo('organization-user', {async: true}) user;
  @attr('date') createdOn;
  @attr() projects;
  @attr('string') type;
  @computed('type')
  get typeValue() {
    return this.intl.t(this.type.toLowerCase());
  }
}

import ENUMS from 'irene/enums';
import { computed } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';

export default class OrganizationCleanupModel extends Model {
  @belongsTo('organization-user', {async: true}) user;
  @attr('date') createdOn;
  @attr() projects;
  @attr('number') type;
  @computed('type')
  get typeValue() {
    return ENUMS.CLEANUP_TYPE[this.get('type')] || "NIL";
  }
}

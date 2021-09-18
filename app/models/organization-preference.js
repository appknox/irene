import Model, { attr } from '@ember-data/model';

export default class OrganizationPreference extends Model {
  @attr() reportPreference;
}

import Model, { attr } from '@ember-data/model';

export default class PartnerPartnerclientProjectModel extends Model {
  @attr('string') packageName;
  @attr('string') platform;
  @attr() lastFile;
}

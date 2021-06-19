import Model, { attr } from '@ember-data/model';

export default class PartnerPartnerclientProjectModel extends Model {
  @attr('string') packageName;
  @attr('string') platform;
  @attr('date') createdOn;

  get platformIcon() {
    return this.platform === 'iOS' ? 'apple' : 'android';
  }
}

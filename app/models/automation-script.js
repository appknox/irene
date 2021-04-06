import Model, { attr } from '@ember-data/model';

export default class AutomationScriptModel extends Model {
  @attr('string') fileName;
  @attr('string') fileKey;
  @attr('number') profile;
  @attr('string') fileName;
  @attr('date') createdOn;
  @attr('boolean', { allowNull: true }) isValid;
}

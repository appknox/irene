import Model, { attr } from '@ember-data/model';

export default class OrgCleanupPreferenceModel extends Model {
  @attr('boolean') isEnabled;
  @attr('number') filesToKeep;
  @attr('date') lastCleanedAt;
}

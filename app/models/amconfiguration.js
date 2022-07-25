import Model, { attr } from '@ember-data/model';

export default class AMConfigurationModel extends Model {
  @attr('boolean') enabled;
  @attr() organisation;
}

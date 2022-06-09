import Model, { attr } from '@ember-data/model';

export default class ProductionScanSettingModel extends Model {
  @attr('boolean') enabled;
}

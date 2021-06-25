import Model, { attr } from '@ember-data/model';

export default class PartnerAnalyticModel extends Model {
  @attr() uploadTimeline;
}

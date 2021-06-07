import Model, { attr } from '@ember-data/model';

export default class PartnerPlanModel extends Model {

  @attr('date') expiryDate;
  @attr('boolean') limitedScans;
  @attr('number') projectsLimit;
  @attr('number') scansLeft;
}

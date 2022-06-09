import Model, { attr } from '@ember-data/model';

export default class PartnerclientFileSummaryModel extends Model {
  @attr('number') riskCountCritical;
  @attr('number') riskCountHigh;
  @attr('number') riskCountMedium;
  @attr('number') riskCountLow;
  @attr('number') riskCountPassed;
  @attr('number') riskCountUntested;
}

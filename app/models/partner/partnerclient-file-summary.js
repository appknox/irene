import Model, { attr } from '@ember-data/model';

export default class PartnerclientFileSummaryModel extends Model {
  @attr('number') riskCountCritical;
  @attr('number') riskCountHigh;
  @attr('number') riskCountMedium;
  @attr('number') riskCountLow;
  @attr('number') riskCountPassed;
  @attr('number') riskCountUntested;

  get totalCount() {
    return (
      this.riskCountCritical +
      this.riskCountHigh +
      this.riskCountMedium +
      this.riskCountLow +
      this.riskCountPassed +
      this.riskCountUntested
    );
  }

  get criticalPercent() {
    return (this.riskCountCritical / this.totalCount) * 100;
  }

  get highPercent() {
    return (this.riskCountHigh / this.totalCount) * 100;
  }

  get mediumPercent() {
    return (this.riskCountMedium / this.totalCount) * 100;
  }

  get lowPercent() {
    return (this.riskCountLow / this.totalCount) * 100;
  }

  get passedPercent() {
    return (this.riskCountPassed / this.totalCount) * 100;
  }

  get untestedPercent() {
    return (this.riskCountUntested / this.totalCount) * 100;
  }
}

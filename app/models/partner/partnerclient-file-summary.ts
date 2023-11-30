import Model, { attr } from '@ember-data/model';

export default class PartnerclientFileSummaryModel extends Model {
  @attr('number')
  declare riskCountCritical: number;

  @attr('number')
  declare riskCountHigh: number;

  @attr('number')
  declare riskCountMedium: number;

  @attr('number')
  declare riskCountLow: number;

  @attr('number')
  declare riskCountPassed: number;

  @attr('number')
  declare riskCountUntested: number;

  get totalCount(): number {
    return (
      this.riskCountCritical +
      this.riskCountHigh +
      this.riskCountMedium +
      this.riskCountLow +
      this.riskCountPassed +
      this.riskCountUntested
    );
  }

  get criticalPercent(): number {
    return (this.riskCountCritical / this.totalCount) * 100;
  }

  get highPercent(): number {
    return (this.riskCountHigh / this.totalCount) * 100;
  }

  get mediumPercent(): number {
    return (this.riskCountMedium / this.totalCount) * 100;
  }

  get lowPercent(): number {
    return (this.riskCountLow / this.totalCount) * 100;
  }

  get passedPercent(): number {
    return (this.riskCountPassed / this.totalCount) * 100;
  }

  get untestedPercent(): number {
    return (this.riskCountUntested / this.totalCount) * 100;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-file-summary': PartnerclientFileSummaryModel;
  }
}

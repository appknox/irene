import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

import ENUMS from 'irene/enums';
import type FileModel from './file';
import type VulnerabilityModel from './vulnerability';

export default class AnalysisOverviewModel extends Model {
  @attr('number')
  declare risk: number;

  @attr('number')
  declare status: number;

  @attr('number')
  declare computedRisk: number;

  @attr('number', { defaultValue: null })
  declare overriddenRisk: number | null;

  @attr('date')
  declare updatedOn: Date;

  @attr('date')
  declare createdOn: Date;

  @belongsTo('vulnerability', { async: true, inverse: null })
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;

  @belongsTo('file', { inverse: 'analyses', async: true })
  declare file: AsyncBelongsTo<FileModel>;

  hasType(type: number) {
    const types = this.vulnerability.get('types');

    if (isEmpty(types)) {
      return false;
    }

    return types?.includes(type);
  }

  get isOverriddenRisk() {
    return !isEmpty(this.overriddenRisk);
  }

  get isNonPassedRiskOverridden() {
    return this.isOverriddenRisk && !this.isRiskPassedBySystem;
  }

  get isRiskPassedBySystem() {
    return this.risk === ENUMS.RISK.NONE;
  }

  get isRisky() {
    const risk = this.computedRisk;
    return ![ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN].includes(risk);
  }

  get isOverriddenAsPassed() {
    return (
      this.overriddenRisk === ENUMS.RISK.NONE && !this.isRiskPassedBySystem
    );
  }

  get vulnerabilityTypes() {
    return this.vulnerability.get('types');
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'analysis-overview': AnalysisOverviewModel;
  }
}

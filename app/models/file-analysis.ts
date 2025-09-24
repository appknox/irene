import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';

import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type FileModel from './file';
import type VulnerabilityModel from './vulnerability';
import type OwaspModel from './owasp';
import type OwaspMobile2024Model from './owaspmobile2024';

export default class FileAnalysisModel extends Model {
  @service declare intl: IntlService;

  @attr('number')
  declare risk: number;

  @attr('number')
  declare status: number;

  @attr('number')
  declare computedRisk: number;

  @attr('number', { defaultValue: null })
  declare overriddenRisk: number | null;

  @belongsTo('vulnerability', { async: true, inverse: null })
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;

  @belongsTo('file', { inverse: 'analyses', async: true })
  declare file: AsyncBelongsTo<FileModel>;

  @hasMany('owasp', { async: true, inverse: null })
  declare owasp: AsyncHasMany<OwaspModel>;

  @hasMany('owaspmobile2024', { async: true, inverse: null })
  declare owaspmobile2024: AsyncHasMany<OwaspMobile2024Model>;

  @attr('date')
  declare updatedOn: Date;

  get isOverriddenRisk() {
    return !isEmpty(this.overriddenRisk);
  }

  get isNonPassedRiskOverridden() {
    return this.isOverriddenRisk && !this.isRiskPassedBySystem;
  }

  get isRiskPassedBySystem() {
    return this.risk === ENUMS.RISK.NONE;
  }

  get isScanning() {
    const risk = this.computedRisk;
    return risk === ENUMS.RISK.UNKNOWN;
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

  hasType(type: number) {
    const types = this.vulnerability.get('types');

    if (isEmpty(types)) {
      return false;
    }

    return types?.includes(type);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    fileAnalysis: FileAnalysisModel;
  }
}

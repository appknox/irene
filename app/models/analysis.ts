import { AsyncHasMany, attr, hasMany } from '@ember-data/model';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Inflector from 'ember-inflector';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import FileAnalysisModel from './file-analysis';
import type AsvsModel from './asvs';
import type AttachmentModel from './attachment';
import type CweModel from './cwe';
import type GdprModel from './gdpr';
import type HipaaModel from './hipaa';
import type MstgModel from './mstg';
import type PcidssModel from './pcidss';
import type MasvsModel from './masvs';
import type OwaspApi2023Model from './owaspapi2023';
import type Nistsp800171Model from './nistsp800171';
import type Nistsp80053Model from './nistsp80053';
import type SamaModel from './sama';
import type Pcidss4Model from './pcidss4';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export interface CvssMetricHumanized {
  key: string;
  value: string;
}

export interface Finding {
  title: string | null;
  description: string;
}

export default class AnalysisModel extends FileAnalysisModel {
  @service declare intl: IntlService;

  @attr
  declare findings: Finding[];

  @attr('number')
  declare cvssBase: number;

  @attr('string')
  declare cvssVector: string;

  @attr('number')
  declare cvssVersion: number;

  @attr
  declare cvssMetricsHumanized: CvssMetricHumanized[];

  @attr('number', { defaultValue: null })
  declare overriddenRisk: number | null;

  @attr('string', { defaultValue: null })
  declare overriddenRiskComment: string | null;

  @attr('string', { defaultValue: null })
  declare overrideCriteria: string | null;

  @attr('string', { defaultValue: null })
  declare overriddenBy: string | null;

  @attr('date')
  declare overriddenDate: Date | null;

  @attr('number')
  declare analiserVersion: number;

  @hasMany('attachment', { async: true, inverse: null })
  declare attachments: AsyncHasMany<AttachmentModel>;

  @hasMany('owaspapi2023', { async: true, inverse: null })
  declare owaspapi2023: AsyncHasMany<OwaspApi2023Model>;

  @hasMany('cwe', { async: true, inverse: null })
  declare cwe: AsyncHasMany<CweModel>;

  @hasMany('asvs', { async: true, inverse: null })
  declare asvs: AsyncHasMany<AsvsModel>;

  @hasMany('masvs', { async: true, inverse: null })
  declare masvs: AsyncHasMany<MasvsModel>;

  @hasMany('mstg', { async: true, inverse: null })
  declare mstg: AsyncHasMany<MstgModel>;

  @hasMany('pcidss', { async: true, inverse: null })
  declare pcidss: AsyncHasMany<PcidssModel>;

  @hasMany('pcidss4', { async: true, inverse: null })
  declare pcidss4: AsyncHasMany<Pcidss4Model>;

  @hasMany('hipaa', { async: true, inverse: null })
  declare hipaa: AsyncHasMany<HipaaModel>;

  @hasMany('gdpr', { async: true, inverse: null })
  declare gdpr: AsyncHasMany<GdprModel>;

  @hasMany('nistsp800171', { async: true, inverse: null })
  declare nistsp800171: AsyncHasMany<Nistsp800171Model>;

  @hasMany('nistsp80053', { async: true, inverse: null })
  declare nistsp80053: AsyncHasMany<Nistsp80053Model>;

  @hasMany('sama', { async: true, inverse: null })
  declare sama: AsyncHasMany<SamaModel>;

  get tLow() {
    return this.intl.t('low');
  }

  get tNone() {
    return this.intl.t('none');
  }
  get tHigh() {
    return this.intl.t('high');
  }

  get tMedium() {
    return this.intl.t('medium');
  }

  get tCritical() {
    return this.intl.t('critical');
  }

  labelClass(risk: number | null) {
    const cls = 'tag';

    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return `${cls} is-progress`;
      case ENUMS.RISK.NONE:
        return `${cls} is-success`;
      case ENUMS.RISK.LOW:
        return `${cls} is-info`;
      case ENUMS.RISK.MEDIUM:
        return `${cls} is-warning`;
      case ENUMS.RISK.HIGH:
        return `${cls} is-danger`;
      case ENUMS.RISK.CRITICAL:
        return `${cls} is-critical`;
    }
  }

  iconClass(risk: number | null) {
    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return 'fa-spinner fa-spin';

      case ENUMS.RISK.NONE:
        return 'fa-check';

      case ENUMS.RISK.CRITICAL:
      case ENUMS.RISK.HIGH:
      case ENUMS.RISK.LOW:
      case ENUMS.RISK.MEDIUM:
        return 'fa-warning';
    }
  }

  get hasCvssBase() {
    return this.cvssVersion === 3;
  }

  get isOverriddenRisk() {
    return !isEmpty(this.overriddenRisk);
  }

  get riskIconClass() {
    return this.iconClass(this.risk);
  }

  get overriddenRiskIconClass() {
    return this.iconClass(this.overriddenRisk);
  }

  get computedRiskIconClass() {
    return this.iconClass(this.computedRisk);
  }

  get riskLabelClass() {
    return this.labelClass(this.risk);
  }

  get overriddenRiskLabelClass() {
    return this.labelClass(this.overriddenRisk);
  }

  get showPcidss() {
    return this.file.get('profile')?.get('reportPreference')?.show_pcidss
      ?.value;
  }

  get showHipaa() {
    return this.file.get('profile')?.get('reportPreference')?.show_hipaa?.value;
  }

  get showGdpr() {
    return this.file.get('profile')?.get('reportPreference')?.show_gdpr?.value;
  }

  get showNist() {
    return this.file.get('profile')?.get('reportPreference')?.show_nist?.value;
  }

  get showSama() {
    return this.file.get('profile')?.get('reportPreference')?.show_sama?.value;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    analysis: AnalysisModel;
  }
}

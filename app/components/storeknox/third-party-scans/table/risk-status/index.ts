import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';

import ENUMS from 'irene/enums';
import type { AkChipColor } from 'irene/components/ak-chip';
import type { ThirdPartyAppTableData } from '..';

interface Signature {
  Args: { data: ThirdPartyAppTableData; loading?: boolean };
}

interface RiskChipConfig {
  label: string;
  color: AkChipColor;
}

const RISK_STATUS = ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS;

export default class StoreknoxThirdPartyScansTableRiskStatusComponent extends Component<Signature> {
  @service declare intl: IntlService;

  get chipConfig(): RiskChipConfig {
    switch (this.args.data.riskStatus) {
      case RISK_STATUS.MINIMAL:
        return {
          label: this.intl.t('storeknox.riskStatus.minimal'),
          color: 'success' as AkChipColor,
        };
      case RISK_STATUS.MEDIUM:
        return {
          label: this.intl.t('storeknox.riskStatus.medium'),
          color: 'warn' as AkChipColor,
        };
      case RISK_STATUS.HIGH:
        return {
          label: this.intl.t('storeknox.riskStatus.high'),
          color: 'error' as AkChipColor,
        };
      default:
        return {
          label: this.intl.t('storeknox.riskStatus.unknown'),
          color: 'default' as AkChipColor,
        };
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::Table::RiskStatus': typeof StoreknoxThirdPartyScansTableRiskStatusComponent;
  }
}

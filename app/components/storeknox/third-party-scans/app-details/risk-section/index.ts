import Component from '@glimmer/component';
import ENUMS from 'irene/enums';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';

interface Signature {
  Args: {
    app: SkThirdPartyAppModel;
  };
}

const RS = ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS;

export default class StoreknoxThirdPartyScansAppDetailsRiskSectionComponent extends Component<Signature> {
  get hasScore() {
    return this.args.app?.score !== null && this.args.app?.score !== undefined;
  }

  get riskSvgComponent() {
    if (!this.hasScore) {
      return null;
    }

    switch (this.args.app?.riskStatus) {
      case RS.HIGH:
        return 'ak-svg/tp-high-risk';
      case RS.MEDIUM:
        return 'ak-svg/tp-medium-risk';
      default:
        return 'ak-svg/tp-minimal-risk';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::AppDetails::RiskSection': typeof StoreknoxThirdPartyScansAppDetailsRiskSectionComponent;
  }
}

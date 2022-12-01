import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

export default class RiskTagComponent extends Component {
  @service intl;

  get analysis() {
    return this.args.analysis || null;
  }

  get isNonPassedRiskOverridden() {
    return (
      this.analysis.overriddenRisk !== null &&
      this.analysis.risk !== ENUMS.RISK.NONE
    );
  }

  get analysisRiskStatus() {
    return analysisRiskStatus([
      this.analysis.computedRisk,
      this.analysis.status,
      this.analysis.isOverriddenRisk,
    ]);
  }
}

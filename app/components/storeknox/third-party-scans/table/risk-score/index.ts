import Component from '@glimmer/component';
import type { ThirdPartyAppTableData } from '..';

interface StoreknoxThirdPartyScansTableRiskScoreSignature {
  Args: { data: ThirdPartyAppTableData; loading?: boolean };
}

export default class StoreknoxThirdPartyScansTableRiskScoreComponent extends Component<StoreknoxThirdPartyScansTableRiskScoreSignature> {
  get hasScore() {
    return (
      this.args.data?.score !== null && this.args.data?.score !== undefined
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::Table::RiskScore': typeof StoreknoxThirdPartyScansTableRiskScoreComponent;
  }
}

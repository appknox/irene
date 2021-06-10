import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';

export default class PartnerCreditTransferInput extends Component {
  get isValidNumber() {
    const transferCount = Number(this.args.transferCount);
    return transferCount
      ? transferCount > 0 &&
          Number.isInteger(transferCount) &&
          this.remainingCredits >= 0
      : false;
  }

  get remainingCredits() {
    return (
      parseInt(this.args.partnerPlan.scansLeft) -
      (parseInt(this.args.transferCount) || 0)
    );
  }

  get isEmptyTitle() {
    return isEmpty(this.args.clientName);
  }
}

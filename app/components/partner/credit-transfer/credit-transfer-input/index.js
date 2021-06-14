import Component from '@glimmer/component';

export default class PartnerCreditTransferInput extends Component {
  get isValidInput() {
    const transferCount = Number(this.args.transferCount);
    return transferCount
      ? transferCount > 0 &&
          Number.isInteger(transferCount) &&
          this.args.remainingCredits >= 0
      : false;
  }
}

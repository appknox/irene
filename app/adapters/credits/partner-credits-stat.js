import commondrf from '../commondrf';

export default class CreditsPartnerCreditsStatAdapter extends commondrf {

  _buildURL() {
    return this.buildURLFromBase(`${this.namespace_v2}/partner/${this.me.partner.id}/credit_statistics`);
  }
}

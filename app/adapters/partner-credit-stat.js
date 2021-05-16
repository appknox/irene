import commondrf from './commondrf';

export default class CreditsPartnerCreditsStatAdapter extends commondrf {

  _buildURL() {
    return this.buildURLFromBase(`${this.namespace_v2}/partners/${this.organization.selected.id}/partner_credits`);
  }
}

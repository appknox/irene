import commondrf from '../commondrf';

export default class PartnerplanAdapter extends commondrf {
  buildURL() {
    return this.buildURLFromBase(`${this.namespace_v2}/partners/${this.organization.selected.id}/plan`);
  }
}

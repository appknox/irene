import commondrf from "../commondrf";

export default class PartnerclientAdapter extends commondrf {
  buildURL() {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partners/${this.organization.selected.id}`
    );
  }
}

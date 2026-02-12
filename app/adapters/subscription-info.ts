import commondrf from './commondrf';

export default class SubscriptionInfoAdapter extends commondrf {
  _buildURL() {
    const baseurl = `${this.namespace}/organizations/${this.organization.selected?.id}/subscription-info`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'subscription-info': SubscriptionInfoAdapter;
  }
}

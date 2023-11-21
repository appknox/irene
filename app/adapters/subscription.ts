import commondrf from './commondrf';

export default class SubscriptionAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseurl = this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/subscriptions`
    );

    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }

    return baseurl;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    subscription: SubscriptionAdapter;
  }
}

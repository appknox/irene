import commondrf from './commondrf';

export default class SkNfInAppNotificationAdapter extends commondrf {
  get baseurl() {
    return `${this.namespace}/v2/sk_nf_in_app_notifications`;
  }

  _buildURL(_modelName: string, id: number | string) {
    const baseurl = this.baseurl;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  markAllAsRead() {
    const baseurl = this.baseurl;
    const url = this.buildURLFromBase(`${baseurl}/mark_all_as_read`);

    return this.ajax(url, 'POST');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-nf-in-app-notification': SkNfInAppNotificationAdapter;
  }
}

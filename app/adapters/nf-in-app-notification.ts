import commondrf from './commondrf';

export default class NfInAppNotificationAdapter extends commondrf {
  get baseurl() {
    return `${this.namespace}/v2/nf_in_app_notifications`;
  }
  _buildURL(modelName: string, id: number | string) {
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
    'nf-in-app-notification': NfInAppNotificationAdapter;
  }
}

import CommondrfNestedAdapter from './commondrf-nested';

export default class ProfileVaNotifEmailAdapter extends CommondrfNestedAdapter {
  _buildURL(_modelName: string | number, id: string | number) {
    const baseurl = `${this.namespace}/va_notif_emails`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  setNestedUrlNamespace(profileId: string) {
    this.namespace = `${this.namespace}/api/profiles/${profileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'profile-va-notif-email': ProfileVaNotifEmailAdapter;
  }
}

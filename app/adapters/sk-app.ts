import SkAppModel from 'irene/models/sk-app';
import CommonDRFAdapter from './commondrf';

export default class SkAddToInventoryAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_app`;

    return this.buildURLFromBase(baseurl);
  }

  async approveApp(id: string): Promise<SkAppModel> {
    const url = this.buildURL().concat(`/${id}/update_approval_status`);

    const data = {
      approval_status: 1,
    };

    return await this.ajax(url, 'PUT', { data });
  }

  async rejectApp(id: string): Promise<SkAppModel> {
    const url = this.buildURL().concat(`/${id}/update_approval_status`);

    const data = {
      approval_status: 2,
    };

    return await this.ajax(url, 'PUT', { data });
  }

  async requestedApps(limit: number, offset: number) {
    const url = this.buildURL().concat(`/requested_apps`);

    return this.ajax(url, 'GET', {
      limit,
      offset,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-app': SkAddToInventoryAdapter;
  }
}

import SkAppModel from 'irene/models/sk-app';
import CommonDRFAdapter from './commondrf';

export default class SkAppAdapter extends CommonDRFAdapter {
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
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-app': SkAppAdapter;
  }
}

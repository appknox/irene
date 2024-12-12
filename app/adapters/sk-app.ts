import CommonDRFAdapter from './commondrf';

import type SkAppModel from 'irene/models/sk-app';
import ENUMS from 'irene/enums';
export default class SkAppAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_app`;

    return this.buildURLFromBase(baseurl);
  }

  async approveApp(id: string): Promise<SkAppModel> {
    const url = this.buildURL().concat(`/${id}/update_approval_status`);

    const data = {
      approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
    };

    return await this.ajax(url, 'PUT', { data });
  }

  async rejectApp(id: string): Promise<SkAppModel> {
    const url = this.buildURL().concat(`/${id}/update_approval_status`);

    const data = {
      approval_status: ENUMS.SK_APPROVAL_STATUS.REJECTED,
    };

    return await this.ajax(url, 'PUT', { data });
  }

  async addAppToInventory(
    ulid: string,
    searchId: string | number
  ): Promise<SkAppModel> {
    const url = this.buildURL();

    const data = {
      doc_ulid: ulid,
      app_discovery_query: searchId,
    };

    const response = await this.ajax(url, 'POST', { data });

    return {
      ...response,
      approvalStatus: response.approval_status,
    } as SkAppModel;
  }

  async checkApprovalStatus(ulid: string): Promise<SkAppModel> {
    const url = this.buildURL().concat(`/check_approval_status`);

    const data = {
      doc_ulid: ulid,
    };

    const response = await this.ajax(url, 'GET', { data });

    return {
      ...response,
      approvalStatus: response.approval_status,
    };
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-app': SkAppAdapter;
  }
}

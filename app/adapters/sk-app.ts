import CommonDRFAdapter from './commondrf';

import type SkAppModel from 'irene/models/sk-app';
import ENUMS from 'irene/enums';

export interface ApprovalStatusResponse {
  id: number;
  approval_status: number;
  approval_status_display: string;
}

export interface ToggleSkAppMonitoringStatusResponse {
  id: number;
  monitoring_enabled: boolean;
}

export default class SkAppAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_app`;

    return this.buildURLFromBase(baseurl);
  }

  async approveApp(id: string): Promise<ApprovalStatusResponse> {
    const url = this.buildURL().concat(`/${id}/update_approval_status`);

    const data = {
      approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
    };

    return await this.ajax(url, 'PUT', { data });
  }

  async rejectApp(id: string): Promise<ApprovalStatusResponse> {
    const url = this.buildURL().concat(`/${id}/update_approval_status`);

    const data = {
      approval_status: ENUMS.SK_APPROVAL_STATUS.REJECTED,
    };

    return await this.ajax(url, 'PUT', { data });
  }

  async addAppToInventory(ulid: string, searchId: string | number) {
    const url = this.buildURL();

    const data = {
      doc_ulid: ulid,
      app_discovery_query: searchId,
    };

    const response = await this.ajax(url, 'POST', { data });

    const normalized = this.store.normalize('sk-app', response);

    return this.store.push(normalized) as SkAppModel;
  }

  async checkApprovalStatus(ulid: string): Promise<ApprovalStatusResponse> {
    const url = this.buildURL().concat(`/check_approval_status`);

    const data = {
      doc_ulid: ulid,
    };

    return await this.ajax(url, 'GET', { data });
  }

  async toggleMonitoring(
    id: string,
    checked: boolean
  ): Promise<ToggleSkAppMonitoringStatusResponse> {
    const url = this.buildURL().concat(
      `/${id}/update_monitoring_enabled_status`
    );

    const data = {
      monitoring_enabled: checked,
    };

    return await this.ajax(url, 'PUT', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-app': SkAppAdapter;
  }
}

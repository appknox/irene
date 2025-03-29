import CommonDRFAdapter from './commondrf';
import { underscore } from '@ember/string';
import type ModelRegistry from 'ember-data/types/registries/model';

import type { AdditionalFilter } from 'irene/models/report-request';

export interface DownloadUrlResponse {
  url: string;
}

export default class ReportRequestAdapter extends CommonDRFAdapter {
  pathForType(type: keyof ModelRegistry) {
    return `ai_reporting/${underscore(`${type}`)}`;
  }

  async previewReport(
    id: string,
    limit: number,
    offset: number,
    additionalFilters?: AdditionalFilter[]
  ) {
    const baseUrl = this.buildURL('report-request', id);

    const data = {
      ...(additionalFilters ? { additional_filters: additionalFilters } : {}),
      limit,
      offset,
    };

    return await this.ajax(`${baseUrl}/preview`, 'POST', { data });
  }

  async downloadUrl(id: string): Promise<DownloadUrlResponse> {
    const baseUrl = this.buildURL('report-request', id);

    return await this.ajax(`${baseUrl}/download_url`, 'GET');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'report-request': ReportRequestAdapter;
  }
}

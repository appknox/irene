import CommonDRFAdapter from '../commondrf';
import { underscore } from '@ember/string';
import type ModelRegistry from 'ember-data/types/registries/model';

import type {
  AdditionalFilter,
  DownloadUrlPayload,
} from 'irene/models/ai-reporting/report-request';

export interface DownloadUrlResponse {
  url: string;
}

export default class AiReportingReportRequestAdapter extends CommonDRFAdapter {
  pathForType(type: keyof ModelRegistry) {
    return underscore(`${type}`);
  }

  async previewReport(
    id: string,
    limit: number,
    offset: number,
    additionalFilters?: AdditionalFilter[]
  ) {
    const baseUrl = this.buildURL('ai-reporting/report-request', id);

    const data = {
      ...(additionalFilters ? { additional_filters: additionalFilters } : {}),
      limit,
      offset,
    };

    return await this.ajax(`${baseUrl}/preview`, 'POST', { data });
  }

  async downloadUrl(
    id: string,
    data: DownloadUrlPayload
  ): Promise<DownloadUrlResponse> {
    const baseUrl = this.buildURL('ai-reporting/report-request', id);

    return await this.ajax(`${baseUrl}/download_url`, 'POST', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'ai-reporting/report-request': AiReportingReportRequestAdapter;
  }
}

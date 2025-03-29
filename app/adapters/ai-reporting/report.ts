import { underscore } from '@ember/string';
import { pluralize } from 'ember-inflector';
import CommonDRFAdapter from '../commondrf';
import type ModelRegistry from 'ember-data/types/registries/model';

export interface DownloadUrlResponse {
  url: string;
}

export default class AiReportingReportAdapter extends CommonDRFAdapter {
  pathForType(type: keyof ModelRegistry) {
    return pluralize(underscore(`${type}`));
  }

  async downloadUrl(id: string): Promise<DownloadUrlResponse> {
    const baseUrl = this.buildURL('ai-reporting/report', id);

    return await this.ajax(`${baseUrl}/download_url`, 'GET');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'ai-reporting/report': AiReportingReportAdapter;
  }
}

import CommonDRFAdapter from './commondrf';
import { underscore } from '@ember/string';
import type ModelRegistry from 'ember-data/types/registries/model';
import type { AdditionalFilter } from 'irene/models/report-request';

export default class ReportRequestAdapter extends CommonDRFAdapter {
  pathForType(type: keyof ModelRegistry) {
    return `ai_reporting/${underscore(`${type}`)}`;
  }

  async previewReport(id: string, additionalFilters?: AdditionalFilter[]) {
    const baseUrl = this.buildURL('report-request', id);

    const data = {
      ...(additionalFilters ? { additional_filters: additionalFilters } : {}),
    };

    return await this.ajax(`${baseUrl}/preview`, 'POST', { data });
  }

  async filterDetails(id: string) {
    const baseUrl = this.buildURL('report-request', id);

    return await this.ajax(`${baseUrl}/filter_details`, 'GET');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'report-request': ReportRequestAdapter;
  }
}

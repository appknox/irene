import CommonDRFAdapter from './commondrf';
import { underscore } from '@ember/string';
import type ModelRegistry from 'ember-data/types/registries/model';

export default class ReportRequestAdapter extends CommonDRFAdapter {
  pathForType(type: keyof ModelRegistry) {
    return `ai_reporting/${underscore(`${type}`)}`;
  }

  async previewReport(id: string, data: unknown = {}) {
    const baseUrl = this.buildURL('report-request', id);

    return await this.ajax(`${baseUrl}/preview`, 'POST', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'report-request': ReportRequestAdapter;
  }
}

import CommonDRFAdapter from './commondrf';
import Store from 'ember-data/store';
import { type Snapshot } from '@ember-data/store';
import type ModelRegistry from 'ember-data/types/registries/model';

export interface InterimReportDownloadDetails {
  url: string;
}

export default class InterimReportAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.hudson_namespace}/interim-reports`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query: { fileId?: string }) {
    const { fileId } = query;

    delete query.fileId;

    return this.buildURLFromBase(
      `${this.hudson_namespace}/files/${fileId}/interim-reports/`
    );
  }

  createRecord<K extends keyof ModelRegistry>(
    store: Store,
    modelClass: { modelName: string | number },
    snapshot: Snapshot<K>
  ) {
    const url = this.buildURLFromBase(
      `${this.hudson_namespace}/files/${encodeURIComponent(snapshot.record.fileId)}/interim-reports/`
    );

    return this.ajax(url, 'POST', {});
  }

  _buildDownloadReportUrl(interimReportId: string) {
    return this.buildURLFromBase(
      `${this.hudson_namespace}/interim-reports/${interimReportId}/pdf/download_url`
    );
  }

  _buildGenerateReportUrl(interimReportId: string) {
    return this.buildURLFromBase(
      `${this.hudson_namespace}/interim-reports/${interimReportId}/pdf/generate`
    );
  }

  generateInterimReport(interimReportId: string) {
    const url = this._buildGenerateReportUrl(interimReportId);

    return this.ajax(url, 'POST') as Promise<{ success: boolean }>;
  }

  fetchDownloadReportDetails(interimReportId: string) {
    const url = this._buildDownloadReportUrl(interimReportId);

    return this.ajax(url, 'GET') as Promise<InterimReportDownloadDetails>;
  }

  toggleCustomerVisibility(
    interimReportId: string,
    isVisibleToCustomer: boolean
  ) {
    const url = this.buildURLFromBase(
      `${this.hudson_namespace}/interim-reports/${interimReportId}/toggle_customer_visibility`
    );

    return this.ajax(url, 'POST', {
      data: { is_visible_to_customer: isVisibleToCustomer },
    });
  }

  canGenerateInterimReport(fileId: string) {
    const url = this.buildURLFromBase(
      `${this.hudson_namespace}/files/${fileId}/interim-reports/can_generate`
    );

    return this.ajax(url, 'GET') as Promise<{ can_generate: boolean }>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'interim-report': InterimReportAdapter;
  }
}

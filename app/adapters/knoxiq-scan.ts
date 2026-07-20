import CommonDRFAdapter from './commondrf';

type KnoxiqScanQuery = { fileId?: string | number; id?: string | number };

export default class KnoxiqScanAdapter extends CommonDRFAdapter {
  buildFileScanUrl(fileId: string | number, path = 'knoxiq_scan') {
    const url = `${this.namespace}/knoxiq/file/${fileId}/${path}/`;

    return this.buildURLFromBase(url);
  }

  urlForQueryRecord(query: KnoxiqScanQuery) {
    const fileId = query.fileId ?? query.id;

    delete query.fileId;

    return this.buildFileScanUrl(fileId as string, 'knoxiq_scan/status');
  }

  async triggerScan(fileId: string | number) {
    const url = this.buildFileScanUrl(fileId);

    await this.ajax(url, 'POST', { data: {} });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'knoxiq-scan': KnoxiqScanAdapter;
  }
}

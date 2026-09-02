import CommonDRFAdapter from './commondrf';

export interface OffsecDownloadDetails {
  url: string;
}

export default class OffsecScanAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/offsec/scans`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query: { fileId?: string }) {
    const { fileId } = query;

    delete query.fileId;

    return this.buildURLFromBase(
      `${this.namespace_v2}/files/${fileId}/offsec_scan`
    );
  }

  /**
   * Fetch a fresh presigned URL for the persisted agent log.
   *
   * Deliberately not an attribute on the model: the underlying URL expires an hour
   * after it is minted, so anything cached in the store would be a dead link.
   */
  fetchLogUrl(modelName: string | number, scanId: string | number) {
    const url = `${this._buildURL(modelName, scanId)}/log_url`;

    return this.ajax(url, 'GET') as Promise<OffsecDownloadDetails>;
  }

  fetchLogStream(modelName: string | number, scanId: string | number) {
    const url = `${this._buildURL(modelName, scanId)}/logstream`;

    return this.ajax(url, 'GET') as Promise<{
      logs?: string | string[];
      lines?: string | string[];
    }>;
  }

  /** As above, for one named artifact of the run. */
  fetchArtifactDownloadUrl(
    modelName: string | number,
    scanId: string | number,
    artifactName: string
  ) {
    const url = `${this._buildURL(modelName, scanId)}/artifacts/${encodeURIComponent(
      artifactName
    )}/download_url`;

    return this.ajax(url, 'GET') as Promise<OffsecDownloadDetails>;
  }

  /** Start a run. `force` is implied — the API always re-runs on an explicit trigger. */
  triggerScan(fileId: string | number, options: TriggerScanOptions = {}) {
    const url = `${this._buildURL()}/trigger`;

    return this.ajax(url, 'POST', {
      data: {
        file: fileId,
        objective: options.objective ?? '',
        device_serial: options.deviceSerial ?? '',
      },
    }) as Promise<{ status: string }>;
  }
}

export interface TriggerScanOptions {
  objective?: string;
  deviceSerial?: string;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'offsec-scan': OffsecScanAdapter;
  }
}

import CommonDRFAdapter from './commondrf';

import ENUMS from 'irene/enums';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type SbomFileModel from 'irene/models/sbom-file';
import type FileRiskModel from 'irene/models/file-risk';
import type FileExploitabilityModel from 'irene/models/file-exploitability';

import FileCapiReportModel, {
  type FileCapiReportScanType,
} from 'irene/models/file-capi-report';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FileCapiReportsResponse {
  message: string;
  reports: FileCapiReportModel[];
  formats_requested: FileCapiReportScanType[];
}

interface ProjectFilesQuery {
  projectId: string;
}

interface PaginatedResponse<T> {
  results: T[];
}

export interface CanGenerateReportResponse {
  can_generate_report: boolean;
  can_generate_legacy_report: boolean;
}

type AdapterPayload = Record<string, unknown> | null | undefined;

/** Predicate used to decide whether a response payload should be pushed. */
type PresenceCheck = (payload: Record<string, unknown>) => boolean;

const hasId: PresenceCheck = (p) => Boolean(p['id']);
const hasFile: PresenceCheck = (p) => Boolean(p['file']);

// ─── Adapter ──────────────────────────────────────────────────────────────────

export default class FileAdapter extends CommonDRFAdapter {
  // ─── URL building ──────────────────────────────────────────────────────────

  _buildURL(_: string | number, id: string | number): string {
    const baseurl = `${this.namespace_v3}/files`;

    return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
  }

  _buildNestedURL(projectId: string): string {
    const filesURL = `${this.namespace_v3}/projects/${projectId}/files`;

    return this.buildURLFromBase(filesURL);
  }

  urlForQuery(query: ProjectFilesQuery): string {
    return this._buildNestedURL(query.projectId);
  }

  /**
   * Builds `/files/<id>/<path>` URLs for the custom endpoints below. Pass
   * `useV2: true` for endpoints that haven't been migrated to v3 yet — this
   * replaces the scattered inline `url.replace(namespace_v3, namespace_v2)`
   * calls.
   */
  private _buildFileURL(
    fileId: string,
    path?: string,
    opts: { useV2?: boolean } = {}
  ): string {
    const base = this._buildURL('file', fileId);
    const fullURL = path ? `${base}/${path}` : base;

    return opts.useV2
      ? fullURL.replace(this.namespace_v3, this.namespace_v2)
      : fullURL;
  }

  // ─── Store helpers ─────────────────────────────────────────────────────────

  private _pushNormalized<T>(
    modelName: string,
    payload: AdapterPayload,
    isPresent: PresenceCheck = hasId
  ): T | null {
    if (!payload || !isPresent(payload)) {
      return null;
    }

    const normalized = this.store.normalize(modelName, payload);

    return this.store.push(normalized) as T;
  }

  private _pushDynamicScanArray(res: unknown): DynamicscanModel[] {
    const dynamicscans: DynamicscanModel[] = [];

    // If the response is not an array and not an object, return an empty array
    if (!Array.isArray(res) && typeof res !== 'object') {
      return [];
    }

    const resArray = Array.isArray(res) ? res : [res];

    for (const item of resArray) {
      if (item && item.id !== null) {
        const dynamicscan = this._pushNormalized('dynamicscan', item);

        if (dynamicscan) {
          dynamicscans.push(dynamicscan as DynamicscanModel);
        }
      }
    }

    return dynamicscans;
  }

  // ─── Dynamic scans ─────────────────────────────────────────────────────────
  private async _getFileDynamicScans(
    fileId: string,
    endpoint: 'last_manual_dynamic_scan' | 'last_automated_dynamic_scan'
  ): Promise<DynamicscanModel[]> {
    const url = this._buildFileURL(fileId, endpoint);
    const res = await this.ajax(url, 'GET');

    return this._pushDynamicScanArray(res);
  }

  async getLastDynamicScan(
    fileId: string,
    mode: number,
    isScheduledScan: boolean
  ): Promise<DynamicscanModel | null> {
    const params = new URLSearchParams({ limit: '1', mode: String(mode) });

    if (isScheduledScan) {
      const engine = ENUMS.DYNAMIC_SCAN_ENGINE.INTERNAL_MANUAL;

      params.append('engine', String(engine));
      params.set('group_status', 'running');
    }

    // TODO: update to use namespace_v3 once the API supports it.
    const baseURL = this._buildFileURL(fileId, 'dynamicscans', { useV2: true });
    const url = `${baseURL}?${params.toString()}`;

    const res = (await this.ajax(url, 'GET')) as PaginatedResponse<
      Record<string, unknown>
    >;

    return this._pushNormalized<DynamicscanModel>(
      'dynamicscan',
      res.results[0]
    );
  }

  async getFileLastManualDynamicScan(
    fileId: string
  ): Promise<DynamicscanModel[]> {
    return this._getFileDynamicScans(fileId, 'last_manual_dynamic_scan');
  }

  async getFileLastAutomatedDynamicScan(
    fileId: string
  ): Promise<DynamicscanModel[]> {
    return this._getFileDynamicScans(fileId, 'last_automated_dynamic_scan');
  }

  // ─── Reports ───────────────────────────────────────────────────────────────

  async generateCapiReports(
    fileId: string,
    fileTypes: FileCapiReportScanType[]
  ): Promise<FileCapiReportsResponse> {
    // TODO: update to use namespace_v3 once the API supports it.
    const url = this._buildFileURL(fileId, 'capi_reports', { useV2: true });

    return this.ajax(url, 'POST', {
      data: { formats: fileTypes },
      headers: this.headers,
    }) as Promise<FileCapiReportsResponse>;
  }

  async getGenerateReportStatus(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/can_generate_report`;
    const res = await this.ajax(url, 'GET');

    return res as CanGenerateReportResponse;
  }

  async getFileAnalysesCvssInfo(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/file_analyses_cvss_info`;
    const res = await this.ajax(url, 'GET');

    return res as { all_file_analyses_are_legacy: boolean };
  }

  // ─── File-scoped resources ─────────────────────────────────────────────────

  async fetchPreviousFile(fileId: string): Promise<FileModel | null> {
    const url = this._buildFileURL(fileId, 'previous_file');
    const res = await this.ajax(url, 'GET');

    return this._pushNormalized<FileModel>('file', res);
  }

  async getSbomFile(fileId: string): Promise<SbomFileModel | null> {
    // TODO: update to use namespace_v3 once the API supports it.
    const url = this._buildFileURL(fileId, 'sb_file', { useV2: true });
    const res = await this.ajax(url, 'GET');

    return this._pushNormalized<SbomFileModel>('sbom-file', res);
  }

  async fetchFileRisk(fileId: string): Promise<FileRiskModel | null> {
    const url = this._buildFileURL(fileId, 'risk');
    const res = await this.ajax(url, 'GET');

    return this._pushNormalized<FileRiskModel>('file-risk', res, hasFile);
  }

  async fetchFileExploitability(
    fileId: string
  ): Promise<FileExploitabilityModel | null> {
    const url = this._buildFileURL(fileId, 'exploitability');
    const res = await this.ajax(url, 'GET');

    return this._pushNormalized<FileExploitabilityModel>(
      'file-exploitability',
      res
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    file: FileAdapter;
  }
}

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import apiMethodChipColor from 'irene/utils/api-method-chip-color';
import type FileModel from 'irene/models/file';
import type ApiScanService from 'irene/services/api-scan';
import type IreneAjaxService from 'irene/services/ajax';
import type { ApiScanUrl } from 'irene/components/file-details/api-scan/progress-status';

export interface ApiScanUrlVulnerability {
  id: number;
  vulnerability: { id: number; name: string };
  risk: number;
  original_risk: number;
  overridden_risk: number | null;
  cvss_base: number;
  cvss_vector: string;
  analysis_id: number | null;
  findings: unknown[];
}

export interface FileDetailsApiScanEndpointVulnerabilitiesSignature {
  Args: {
    file: FileModel;
    urlId: string;
  };
}

export default class FileDetailsApiScanEndpointVulnerabilitiesComponent extends Component<FileDetailsApiScanEndpointVulnerabilitiesSignature> {
  @service declare apiScan: ApiScanService;
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked scanUrl: ApiScanUrl | null = null;
  @tracked vulnerabilities: ApiScanUrlVulnerability[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsApiScanEndpointVulnerabilitiesSignature['Args']
  ) {
    super(owner, args);

    this.apiScan.setFooterComponent(null, {});
    this.fetchEndpointVulnerabilities.perform();
  }

  get columns() {
    return [
      {
        id: 'impact',
        name: this.intl.t('impact'),
        width: 50,
        textAlign: 'center',
      },
      { id: 'title', name: this.intl.t('title'), width: 250 },
    ];
  }

  get isLoading() {
    return this.fetchEndpointVulnerabilities.isRunning;
  }

  get hasNoVulnerabilities() {
    return this.vulnerabilities.length === 0;
  }

  get scanUrlEndpoint() {
    return [
      ENV.endpoints['files'],
      this.args.file.id,
      ENV.endpoints['apiScanUrls'],
      this.args.urlId,
    ].join('/');
  }

  @action
  methodChipColor(method: string) {
    return apiMethodChipColor(method);
  }

  @action
  isRiskOverridden(vulnerability: ApiScanUrlVulnerability) {
    return vulnerability.overridden_risk !== null;
  }

  @action
  isRowClickable(vulnerability: ApiScanUrlVulnerability) {
    return vulnerability.analysis_id !== null;
  }

  // Opens the file-level analysis scoped to this endpoint's findings;
  // modifier-click opens a tab
  @action
  handleRowClick({
    rowValue,
    event,
  }: {
    rowValue: ApiScanUrlVulnerability;
    event: MouseEvent;
  }) {
    if (rowValue.analysis_id === null) {
      return;
    }

    const route = 'authenticated.dashboard.file.analysis';
    const fileId = this.args.file.id;
    const id = String(rowValue.analysis_id);
    const options = { queryParams: { api_scan_url: this.args.urlId } };

    if (event.ctrlKey || event.metaKey) {
      window.open(this.router.urlFor(route, fileId, id, options), '_blank');
    } else {
      this.router.transitionTo(route, fileId, id, options);
    }
  }

  fetchEndpointVulnerabilities = task(async () => {
    const options = { namespace: ENV.namespace_v2 };

    try {
      const [scanUrl, vulnerabilities] = await Promise.all([
        this.ajax.request<ApiScanUrl>(this.scanUrlEndpoint, options),
        this.ajax.request<ApiScanUrlVulnerability[]>(
          `${this.scanUrlEndpoint}/${ENV.endpoints['apiScanUrlVulnerabilities']}`,
          options
        ),
      ]);

      this.scanUrl = scanUrl;
      this.vulnerabilities = vulnerabilities;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::EndpointVulnerabilities': typeof FileDetailsApiScanEndpointVulnerabilitiesComponent;
  }
}

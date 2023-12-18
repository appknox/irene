import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import OrganizationService from 'irene/services/organization';

export interface IScanCount {
  api_scan_count: number;
  dynamic_scan_count: number;
  id: number;
  manual_scan_count: number;
  static_scan_count: number;
  total_android_scan_count: number;
  total_ios_scan_count: number;
  total_scan_count: number;
}

export default class OrganizationAnalyticsComponent extends Component {
  @service declare ajax: any;
  @service declare organization: OrganizationService;

  @tracked scanCount: IScanCount | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchScanCount.perform();
  }

  fetchScanCount = task(async () => {
    const orgId = this.organization?.selected?.id;

    const scancountUrl = [
      ENV.endpoints['organizations'],
      orgId,
      ENV.endpoints['scancount'],
    ].join('/');

    this.scanCount = await this.ajax.request(scancountUrl);
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationAnalytics: typeof OrganizationAnalyticsComponent;
  }
}

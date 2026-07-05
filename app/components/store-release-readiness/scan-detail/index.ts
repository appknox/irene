import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type StoreReleaseScanModel from 'irene/models/store-release-scan';
import type StoreReleaseScanAdapter from 'irene/adapters/store-release-scan';
import type Store from 'ember-data/store';

interface ScanDetailSignature {
  Args: {
    scan: StoreReleaseScanModel;
  };
}

export default class ScanDetailComponent extends Component<ScanDetailSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;

  @tracked groupBy: 'category' | 'status' = 'category';

  get groupingOptions() {
    return [
      { label: this.intl.t('storeReleaseReadiness.byCategory'), value: 'category' },
      { label: this.intl.t('storeReleaseReadiness.byStatus'), value: 'status' },
    ];
  }

  get selectedGrouping() {
    return this.groupingOptions.find(opt => opt.value === this.groupBy);
  }

  @action
  setGroupBy(option: { label: string; value: 'category' | 'status' } | null) {
    if (option) {
      this.groupBy = option.value;
    }
  }

  @action
  async downloadReport() {
    const adapter = this.store.adapterFor('store-release-scan') as StoreReleaseScanAdapter;
    await adapter.downloadReport(this.args.scan.id);
  }

  @action
  async triggerRescan() {
    // Trigger the API endpoint to manually re-trigger the scan
    try {
      const adapter = this.store.adapterFor('store-release-scan') as any;
      const url = adapter.buildURLFromBase(
        `${adapter.namespace_v2}/store-release-readiness/scans/${this.args.scan.id}/trigger/`
      );

      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      // Reload the scan
      await this.args.scan.reload();
    } catch (error) {
      console.error('Failed to trigger rescan', error);
    }
  }

  private getAuthToken(): string {
    // Get auth token from session/storage
    return localStorage.getItem('auth_token') || '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanDetail': typeof ScanDetailComponent;
  }
}

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type StoreReleaseReadinessService from 'irene/services/store-release-readiness';

interface StoreReleaseReadinessIndexSignature {
  Args: {
    service: StoreReleaseReadinessService;
  };
}

export default class StoreReleaseReadinessIndexComponent extends Component<StoreReleaseReadinessIndexSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  get platformOptions() {
    return [
      { label: this.intl.t('storeReleaseReadiness.allPlatforms'), value: '' },
      { label: 'Android', value: 'ANDROID' },
      { label: 'iOS', value: 'IOS' },
    ];
  }

  get verdictOptions() {
    return [
      { label: this.intl.t('storeReleaseReadiness.allVerdict'), value: '' },
      { label: this.intl.t('storeReleaseReadiness.highRejectionRisk'), value: 'HIGH_REJECTION_RISK' },
      { label: this.intl.t('storeReleaseReadiness.mediumRejectionRisk'), value: 'MODERATE_REJECTION_RISK' },
      { label: this.intl.t('storeReleaseReadiness.lowRejectionRisk'), value: 'LOW_REJECTION_RISK' },
    ];
  }

  get selectedPlatform() {
    return this.platformOptions.find(opt => opt.value === this.args.service.platformFilter);
  }

  get selectedVerdict() {
    return this.verdictOptions.find(opt => opt.value === this.args.service.verdictFilter);
  }

  @action
  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.args.service.searchQuery = target.value;
    this.args.service.offset = 0;
    this.args.service.reload();
  }

  @action
  onPlatformChange(option: { label: string; value: string } | null) {
    this.args.service.platformFilter = option?.value || '';
    this.args.service.offset = 0;
    this.args.service.reload();
  }

  @action
  onVerdictChange(option: { label: string; value: string } | null) {
    this.args.service.verdictFilter = option?.value || '';
    this.args.service.offset = 0;
    this.args.service.reload();
  }

  @action
  navigateToDetail(scanId: string) {
    this.router.transitionTo(
      'authenticated.dashboard.store-release-readiness.scan',
      scanId
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::Index': typeof StoreReleaseReadinessIndexComponent;
  }
}

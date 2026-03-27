import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { debounceTask } from 'ember-lifeline';

import type SkAppsService from 'irene/services/sk-apps';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type IntlService from 'ember-intl/services/intl';

export default class StoreknoxFakeAppsComponent extends Component {
  @service('sk-apps') declare skAppsService: SkAppsService;
  @service declare router: RouterService;
  @service declare intl: IntlService;

  @tracked searchQuery = '';

  @action
  onSearchQueryChange(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;

    debounceTask(this, 'setSearchQuery', this.searchQuery, 500);
  }

  setSearchQuery(query: string) {
    this.skAppsService.searchQuery = query;
    this.skAppsService.fetchFakeApps.perform();
  }

  @action
  clearSearchInput() {
    this.searchQuery = '';
    this.skAppsService.searchQuery = '';
    this.skAppsService.fetchFakeApps.perform();
  }

  get skFakeApps() {
    return this.skAppsService.skApps;
  }

  get totalAppsCount() {
    return this.skAppsService.skAppsCount;
  }

  get isFetchingTableData() {
    return this.skAppsService.isFetchingSkFakeApps;
  }

  get showEmptyState() {
    return !this.isFetchingTableData && this.totalAppsCount === 0;
  }

  get showPagination() {
    return this.totalAppsCount > this.skAppsService.limit;
  }

  get hidePagination() {
    return this.showEmptyState || this.isFetchingTableData;
  }

  get defaultLimit() {
    return this.skAppsService.limit;
  }

  get offset() {
    return this.skAppsService.offset;
  }

  get aiDrawerInfo() {
    return [
      {
        title: this.intl.t('storeknox.fakeApps.aiDataAccess'),
        body: this.intl.t('storeknox.fakeApps.aiDataAccessDescription'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('storeknox.fakeApps.aiDataUsage'),
        body: this.intl.t('storeknox.fakeApps.aiDataUsageDescription'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('storeknox.fakeApps.aiDataProtection'),
        contentList: [
          this.intl.t('storeknox.fakeApps.aiDataProtectionList.item1'),
          this.intl.t('storeknox.fakeApps.aiDataProtectionList.item2'),
          this.intl.t('storeknox.fakeApps.aiDataProtectionList.item3'),
        ],
        marginTop: 'mt-2',
      },
    ];
  }

  @action
  onItemPerPageChange(args: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: args.limit,
        app_offset: 0,
      },
    });
  }

  @action
  goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps': typeof StoreknoxFakeAppsComponent;
  }
}

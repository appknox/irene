import { service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import { ServiceAccountType } from 'irene/models/service-account';
import type ServiceAccountModel from 'irene/models/service-account';
import type { OrganizationSettingsServiceAccountRouteQueryParams } from 'irene/routes/authenticated/dashboard/organization-settings/service-account';

export interface OrganizationServiceAccountListSignature {
  Args: {
    queryParams: OrganizationSettingsServiceAccountRouteQueryParams;
  };
}

type ServiceAccountQueryResponse =
  DS.AdapterPopulatedRecordArray<ServiceAccountModel> & {
    meta: { count: number };
  };

export default class OrganizationServiceAccountListComponent extends Component<OrganizationServiceAccountListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked serviceAccountResponse: ServiceAccountQueryResponse | null = null;
  @tracked moreMenuAnchorRef: HTMLElement | null = null;
  @tracked serviceAccountToDelete: ServiceAccountModel | null = null;

  constructor(
    owner: unknown,
    args: OrganizationServiceAccountListSignature['Args']
  ) {
    super(owner, args);

    this.fetchServiceAccounts.perform(
      this.limit,
      this.offset,
      this.showSystemCreated,
      false
    );
  }

  get columns() {
    return [
      {
        name: this.intl.t('accountName'),
        valuePath: 'name',
      },
      {
        name: this.intl.t('accessKeyID'),
        valuePath: 'accessKeyId',
        width: 150,
      },
      {
        name: this.intl.t('expiryOn'),
        component: 'organization/service-account/list/expiry-on',
      },
      {
        name: this.intl.t('createdBy'),
        valuePath: 'createdByUser.username',
      },
      {
        name: this.intl.t('action'),
        textAlign: 'center',
        width: 60,
        component: 'organization/service-account/list/action',
      },
    ];
  }

  get limit() {
    return this.args.queryParams.sa_limit;
  }

  get offset() {
    return this.args.queryParams.sa_offset;
  }

  get showSystemCreated() {
    return this.args.queryParams.show_system_created;
  }

  get serviceAccountList() {
    return this.serviceAccountResponse?.slice() || [];
  }

  get totalServiceAccountCount() {
    return this.serviceAccountResponse?.meta?.count || 0;
  }

  get hasNoServiceAccount() {
    return this.totalServiceAccountCount === 0;
  }

  @action
  handleMoreOptionsClick(
    serviceAccount: ServiceAccountModel,
    event: MouseEvent
  ) {
    this.serviceAccountToDelete = serviceAccount;
    this.moreMenuAnchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleMoreOptionsClose() {
    this.moreMenuAnchorRef = null;
  }

  @action
  handleShowSystemCreated(event: Event, checked: boolean) {
    this.fetchServiceAccounts.perform(this.limit, 0, checked);
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.fetchServiceAccounts.perform(limit, offset, this.showSystemCreated);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.fetchServiceAccounts.perform(limit, 0, this.showSystemCreated);
  }

  @action
  handleRefreshServiceAccounts() {
    this.fetchServiceAccounts.perform(
      this.limit,
      this.offset,
      this.showSystemCreated
    );
  }

  setRouteQueryParams(
    limit?: number,
    offset?: number,
    showSystemCreated?: boolean
  ) {
    this.router.transitionTo({
      queryParams: {
        sa_limit: limit,
        sa_offset: offset,
        show_system_created: showSystemCreated,
      },
    });
  }

  fetchServiceAccounts = task(
    async (
      limit: number,
      offset: number,
      showSystemCreated: boolean,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, showSystemCreated);
      }

      const data: Record<string, number> = { limit, offset };

      if (!showSystemCreated) {
        data['service_account_type'] = ServiceAccountType.USER;
      }

      try {
        this.serviceAccountResponse = (await this.store.query(
          'service-account',
          data
        )) as ServiceAccountQueryResponse;
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::List': typeof OrganizationServiceAccountListComponent;
  }
}

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import StoreService from '@ember-data/store';
import RouterService from '@ember/routing/router-service';
import MeService from 'irene/services/me';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import OrganizationNamespaceModel from 'irene/models/organization-namespace';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

export interface OrganizationNamespaceQueryParams {
  namespaceLimit: number;
  namespaceOffset: number;
}

type NamespaceQueryResponse =
  DS.AdapterPopulatedRecordArray<OrganizationNamespaceModel> & {
    meta?: { count: number };
  };

export interface OrganizationNamespaceComponentSignature {
  Args: {
    queryParams: OrganizationNamespaceQueryParams;
    limit?: number;
    offset?: number;
  };
  Element: HTMLElement;
}

export default class OrganizationNamespaceComponent extends Component<OrganizationNamespaceComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: StoreService;
  @service declare router: RouterService;

  @tracked showRejectNamespaceConfirm = false;
  @tracked selectedNamespace: OrganizationNamespaceModel | null = null;
  @tracked namespaceResponse: NamespaceQueryResponse | null = null;

  constructor(
    owner: unknown,
    args: OrganizationNamespaceComponentSignature['Args']
  ) {
    super(owner, args);
    const { namespaceLimit, namespaceOffset } = this.args.queryParams;

    this.fetchNamespace.perform(namespaceLimit, namespaceOffset);
  }

  get namespaceList() {
    return this.namespaceResponse?.toArray() || [];
  }

  get totalNamespaceCount() {
    return this.namespaceResponse?.meta?.count || 0;
  }

  get hasNoNamespace() {
    return this.totalNamespaceCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('namespace'),
        component: 'organization-namespace/namespace-value',
      },
      {
        name: this.intl.t('requestStatus'),
        component: 'organization-namespace/request-status',
      },
      {
        name: this.intl.t('approvalStatus'),
        component: 'organization-namespace/approval-status',
      },
    ];
  }

  /* Open reject-namespace confirmation */
  @action
  rejectNamespaceConfirm(namespace: OrganizationNamespaceModel) {
    this.showRejectNamespaceConfirm = true;
    this.selectedNamespace = namespace;
  }

  @action
  rejectNamespaceCancel() {
    this.showRejectNamespaceConfirm = false;
    this.selectedNamespace = null;
  }

  @action
  handleNextAction({ limit, offset }: { limit: number; offset: number }) {
    this.router.transitionTo({
      queryParams: { namespace_limit: limit, namespace_offset: offset },
    });

    this.fetchNamespace.perform(limit, offset);
  }

  @action
  handlePrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.router.transitionTo({
      queryParams: { namespace_limit: limit, namespace_offset: offset },
    });

    this.fetchNamespace.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.router.transitionTo({
      queryParams: { namespace_limit: limit, namespace_offset: 0 },
    });

    this.fetchNamespace.perform(limit, 0);
  }

  fetchNamespace = task(async (limit, offset) => {
    try {
      this.namespaceResponse = await this.store.query(
        'organization-namespace',
        {
          limit,
          offset,
        }
      );
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });

  /* Reject namespace action */
  confirmReject = task(async () => {
    try {
      const namespace = this.selectedNamespace;

      namespace?.deleteRecord();
      await namespace?.save();

      this.notify.success(this.intl.t('namespaceRejected'));
      triggerAnalytics(
        'feature',
        ENV.csb['namespaceRejected'] as CsbAnalyticsFeatureData
      );

      this.showRejectNamespaceConfirm = false;
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationNamespace: typeof OrganizationNamespaceComponent;
  }
}

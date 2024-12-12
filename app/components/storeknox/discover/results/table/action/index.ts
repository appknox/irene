import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import type MeService from 'irene/services/me';
import type SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';
import { tracked } from 'tracked-built-ins';
import type { StoreknoxDiscoveryResultQueryParam } from 'irene/routes/authenticated/storeknox/discover/result';
import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';

interface StoreknoxDiscoverResultsTableActionSignature {
  Args: {
    data: SkDiscoverySearchResultModel;
    loading: boolean;
    queryParams: StoreknoxDiscoveryResultQueryParam;
  };
}

export default class StoreknoxDiscoverResultsTableActionComponent extends Component<StoreknoxDiscoverResultsTableActionSignature> {
  @service declare me: MeService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked requested: boolean = false;
  @tracked approved: boolean = false;
  @tracked buttonLoading: boolean = false;

  constructor(
    owner: unknown,
    args: StoreknoxDiscoverResultsTableActionSignature['Args']
  ) {
    super(owner, args);

    this.checkStatus.perform();
  }

  get isAdmin() {
    return this.me.org?.is_admin;
  }

  get iconValue() {
    const isApproved = this.approved;

    return {
      className: isApproved ? 'already-exist-icon' : 'requested-icon',
      iconName: isApproved ? 'inventory-2' : 'schedule-send',
      tooltipText: this.intl.t(
        isApproved
          ? 'storeknox.appAlreadyExists'
          : 'storeknox.appAlreadyRequested'
      ),
    };
  }

  addToInventory = task(async () => {
    this.buttonLoading = true;

    try {
      const searchId = this.args.queryParams.app_search_id;

      const discoverApp = this.args.data;

      const res = await waitForPromise(
        discoverApp.addAppToInventory(discoverApp.docUlid, searchId)
      );

      this.requested = true;

      if (res.approvalStatus === ENUMS.SK_APPROVAL_STATUS.APPROVED) {
        this.approved = true;

        this.notify.success(
          this.intl.t('storeknox.appAddedToInventory', {
            appName: discoverApp.title,
          })
        );
      } else if (
        res.approvalStatus === ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL
      ) {
        this.notify.success(
          this.intl.t('storeknox.appRequested', {
            appName: discoverApp.title,
          })
        );
      }
    } catch (error) {
      this.notify.error(parseError(error));
    }

    this.buttonLoading = false;
  });

  checkStatus = task(async () => {
    try {
      const res = await waitForPromise(
        this.args.data.checkApprovalStatus(this.args.data.docUlid)
      );

      if (res.approvalStatus === 1) {
        this.approved = true;
      }

      this.requested = true;
    } catch (e: any) {
      if (e?.errors && e.errors[0]?.status === '404') {
        this.requested = false;
      }
    }
  });

  @action
  handleAddToInventory() {
    this.addToInventory.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Table::Action': typeof StoreknoxDiscoverResultsTableActionComponent;
  }
}

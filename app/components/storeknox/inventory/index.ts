// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type SkPendingReviewService from 'irene/services/sk-pending-review';
import type MeService from 'irene/services/me';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkOrganizationModel from 'irene/models/sk-organization';

type SkAppsQueryResponse =
  DS.AdapterPopulatedRecordArray<SkInventoryAppModel> & {
    meta: { count: number };
  };

export default class StoreknoxInventoryComponent extends Component {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare me: MeService;
  @service declare skPendingReview: SkPendingReviewService;
  @service('notifications') declare notify: NotificationService;

  @tracked selectedSkOrg: SkOrganizationModel | undefined;
  @tracked showWelcomeModal = false;
  @tracked showSettingsDrawer = false;

  @tracked totalInventoryAppsCount = 0;
  @tracked totalDisabledAppsCount = 0;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getTabItemsCount.perform();
    this.getSkOrganization.perform();
  }

  get isOwner() {
    return this.me.org?.is_owner;
  }

  get tabItems() {
    return [
      {
        id: 'app-inventory',
        route: 'authenticated.storeknox.inventory.app-list',
        label: this.intl.t('storeknox.appInventory'),
        hasBadge: this.totalInventoryAppsCount > 0,
        badgeCount: this.totalInventoryAppsCount,
      },
      this.isOwner && {
        id: 'pending-review',
        route: 'authenticated.storeknox.inventory.pending-reviews',
        label: this.intl.t('storeknox.pendingReview'),
        hasBadge: this.skPendingReview.totalCount > 0,
        badgeCount: this.skPendingReview.totalCount,
      },
      // {
      //   id: 'disabled-apps',
      //   route: 'authenticated.storeknox.inventory.disabled-apps',
      //   label: this.intl.t('storeknox.disabledApps'),
      //   activeRoutes: 'authenticated.storeknox.inventory.disabled-apps',
      //   hasBadge: this.totalDisabledAppsCount > 0,
      //   badgeCount: this.totalDisabledAppsCount,
      // },
    ].filter(Boolean);
  }

  @action closeWelcomeModal() {
    this.showWelcomeModal = false;
  }

  @action openSettingsDrawer() {
    this.showSettingsDrawer = true;
  }

  @action closeSettingsDrawer() {
    this.showSettingsDrawer = false;
  }

  @action onToggleAddToInventoryByDefault(_: Event, checked?: boolean) {
    this.toggleAddToInventoryByDefault.perform(checked);
  }

  getTabItemsCount = task(async () => {
    // Fetches the inventory list items total count
    this.totalInventoryAppsCount = (
      (await this.store.query('sk-app', {
        approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
        app_status: ENUMS.SK_APP_STATUS.ACTIVE,
      })) as SkAppsQueryResponse
    ).meta.count;

    // Get Pending review data
    if (this.isOwner) {
      this.skPendingReview.fetchPendingReviewApps.perform(10, 0, false);
    }
  });

  toggleAddToInventoryByDefault = task(async (checked?: boolean) => {
    try {
      const org =
        await this.selectedSkOrg?.toggleAddToInventoryByDefault(!!checked);

      this.selectedSkOrg = org;

      this.notify.success(
        this.intl.t('storeknox.addAppknoxProjectsByDefaultSuccessMessage')
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  getSkOrganization = task(async () => {
    try {
      const skOrgs = await this.store.findAll('sk-organization');

      this.selectedSkOrg = skOrgs.slice()[0];
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory': typeof StoreknoxInventoryComponent;
  }
}

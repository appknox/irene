import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type SkPendingReviewService from 'irene/services/sk-pending-review';
import type MeService from 'irene/services/me';
import type SkOrganizationModel from 'irene/models/sk-organization';
import type SkInventoryAppService from 'irene/services/sk-inventory-apps';
import type { SkOrgSettingsToggleProps } from 'irene/adapters/sk-organization';

export default class StoreknoxInventoryComponent extends Component {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare me: MeService;
  @service declare skPendingReview: SkPendingReviewService;
  @service('notifications') declare notify: NotificationService;

  @service('sk-inventory-apps')
  declare skInventoryAppsService: SkInventoryAppService;

  @tracked selectedSkOrg: SkOrganizationModel | undefined;
  @tracked showWelcomeModal = false;
  @tracked showSettingsDrawer = false;

  @tracked totalDisabledAppsCount = 0;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getSkOrganization.perform();
  }

  get isOwner() {
    return !!this.me.org?.is_owner;
  }

  get tabItems() {
    return [
      {
        id: 'app-inventory',
        route: 'authenticated.storeknox.inventory.app-list',
        label: this.intl.t('storeknox.appInventory'),
        hasBadge: this.skInventoryAppsService.skInventoryAppsCount > 0,
        badgeCount: this.skInventoryAppsService.skInventoryAppsCount,
      },
      this.isOwner && {
        id: 'pending-review',
        route: 'authenticated.storeknox.inventory.pending-reviews',
        label: this.intl.t('storeknox.pendingReview'),
        hasBadge: this.skPendingReview.skPendingReviewAppsCount > 0,
        badgeCount: this.skPendingReview.skPendingReviewAppsCount,
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

  @action
  onToggleAddToInventoryByDefault(_: Event, checked: boolean) {
    this.handleToggleTask.perform({
      add_appknox_project_to_inventory_by_default: checked,
    });
  }

  @action
  onToggleAutoDiscoveryEnabled(_: Event, checked: boolean) {
    this.handleToggleTask.perform({
      auto_discovery_enabled: checked,
    });
  }

  handleToggleTask = task(async (data: SkOrgSettingsToggleProps) => {
    try {
      this.selectedSkOrg?.toggleEvent(data);

      this.notify.success(this.intl.t('storeknox.statusToggleSuccessMessage'));
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

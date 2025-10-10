import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type { SkOrgSettingsToggleProps } from 'irene/adapters/sk-organization';
import type SkPendingReviewService from 'irene/services/sk-pending-review';
import type MeService from 'irene/services/me';
import type SkAppsService from 'irene/services/sk-apps';
import type SkOrganizationService from 'irene/services/sk-organization';

interface TabItem {
  id: string;
  route: string;
  label: string;
  hasBadge: boolean;
  badgeCount: number;
}

export default class StoreknoxInventoryComponent extends Component {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare me: MeService;
  @service declare skPendingReview: SkPendingReviewService;

  @service('notifications') declare notify: NotificationService;
  @service('sk-organization') declare skOrgService: SkOrganizationService;
  @service('sk-apps') declare skAppsService: SkAppsService;

  @tracked showWelcomeModal = false;
  @tracked showSettingsDrawer = false;

  get isOwner() {
    return !!this.me.org?.is_owner;
  }

  get skOrg() {
    return this.skOrgService.selected;
  }

  get tabItems() {
    return [
      {
        id: 'app-inventory',
        route: 'authenticated.storeknox.inventory.app-list',
        label: this.intl.t('storeknox.appInventory'),
        hasBadge: this.skAppsService.skAppsCount > 0,
        badgeCount: this.skAppsService.skAppsCount,
      },
      this.isOwner && {
        id: 'pending-review',
        route: 'authenticated.storeknox.inventory.pending-reviews',
        label: this.intl.t('storeknox.pendingReview'),
        hasBadge: this.skPendingReview.skPendingReviewAppsCount > 0,
        badgeCount: this.skPendingReview.skPendingReviewAppsCount,
      },
    ].filter(Boolean) as TabItem[];
  }

  get shouldShowSettingsDrawer() {
    return this.isOwner && this.showSettingsDrawer;
  }

  get addAppknoxProjectsByDefault() {
    return this.skOrg?.addAppknoxProjectToInventoryByDefault;
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
  onToggleAddToInventoryByDefault(_: Event, checked?: boolean) {
    this.handleToggleTask.perform({
      add_appknox_project_to_inventory_by_default: checked,
    });
  }

  @action
  onToggleAutoDiscoveryEnabled(_: Event, checked?: boolean) {
    this.handleToggleTask.perform({
      auto_discovery_enabled: checked,
    });
  }

  handleToggleTask = task(async (data: SkOrgSettingsToggleProps) => {
    try {
      await this.skOrg?.toggleEvent(data);

      this.notify.success(this.intl.t('storeknox.statusToggleSuccessMessage'));
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

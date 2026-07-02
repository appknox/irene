import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { FakeAppTableRowData } from 'irene/components/storeknox/fake-apps/fake-app-list/list';

export interface StoreknoxFakeAppsFakeAppListTableActionSignature {
  Args: {
    data: FakeAppTableRowData;
    loading?: boolean;
  };
}

export default class StoreknoxFakeAppsFakeAppListTableActionComponent extends Component<StoreknoxFakeAppsFakeAppListTableActionSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked showIgnoreDrawer = false;
  @tracked addToInventory = false;

  get isApkModyOrAptoideStore() {
    return (
      this.args.data.skFakeApp.isApkModyStore ||
      this.args.data.skFakeApp.isAptoideStore
    );
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('storeknox.fakeApps.ignore'),
        onClick: () => this.openIgnoreDrawer(false),
        divider: !this.isApkModyOrAptoideStore,
      },
      ...(!this.isApkModyOrAptoideStore
        ? [
            {
              label: this.intl.t('storeknox.fakeApps.ignoreAndAddToInventory'),
              onClick: () => this.openIgnoreDrawer(true),
            },
          ]
        : []),
    ];
  }

  @action
  openIgnoreDrawer(addToInventory = false) {
    this.showIgnoreDrawer = true;
    this.addToInventory = addToInventory;
    this.handleCloseMenu();
  }

  @action
  closeIgnoreDrawer() {
    this.showIgnoreDrawer = false;
    this.addToInventory = false;
  }

  @action
  handleOpenMenu(event: MouseEvent) {
    event.stopPropagation();
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleCloseMenu() {
    this.anchorRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Table::Action': typeof StoreknoxFakeAppsFakeAppListTableActionComponent;
  }
}

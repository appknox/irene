import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from 'ember-data/store';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type OrganizationService from 'irene/services/organization';
import type MeService from 'irene/services/me';
import type SkOrganizationService from 'irene/services/sk-organization';
import { action } from '@ember/object';

type MenuItem = {
  label: string;
  icon?: string;
  divider?: boolean;
  button?: boolean;
  link?: boolean;
  route?: string;
  model?: string;
  onClick?: () => void;
  hidden?: boolean;
};

interface StoreknoxFakeAppsFakeAppDetailsHeaderSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxFakeAppsFakeAppDetailsHeaderComponent extends Component<StoreknoxFakeAppsFakeAppDetailsHeaderSignature> {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;

  @service('sk-organization') declare skOrg: SkOrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked monitoringChecked = false;
  @tracked anchorRef: HTMLElement | null = null;

  constructor(
    owner: unknown,
    args: StoreknoxFakeAppsFakeAppDetailsHeaderSignature['Args']
  ) {
    super(owner, args);

    // this.monitoringChecked = args.skInventoryApp?.monitoringEnabled;
  }

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get appHasLicense() {
    return this.skInventoryApp?.hasLicense;
  }

  get isOwnerOrAdmin() {
    const isOwner = this.me.org?.is_owner;
    const isAdmin = this.me.org?.is_admin;

    return isOwner || isAdmin;
  }

  get canToggleMonitoring() {
    return this.isOwnerOrAdmin;
  }

  get routeLocalName() {
    return this.router.currentRoute.name;
  }

  get appCoreProjectLatestVersion() {
    return this.args.skInventoryApp?.coreProjectLatestVersion;
  }

  get archiveDateStringFromNow() {
    return dayjs().add(6, 'month').format('MMM D, YYYY');
  }

  get appTitle() {
    return this.skInventoryApp?.appMetadata.title;
  }

  get disableArchiving() {
    return (
      this.skInventoryApp?.isArchived && !this.skInventoryApp?.canUnarchive
    );
  }

  get lastMonitoredDate() {
    return dayjs(this.skInventoryApp.lastMonitoredOn).format('DD MMM, YYYY');
  }

  // get showArchivedAppsInfoTagDivider() {
  //   return (
  //     !this.skInventoryApp.isArchived ||
  //     (this.skInventoryApp.isArchived && this.activeRouteTagProps)
  //   );
  // }

  get showArchiveButton() {
    return this.isOwnerOrAdmin;
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('storeknox.viewInInventory'),
        button: false,
        link: true,
        route: 'authenticated.storeknox.inventory-details.index',
        model: this.args.skInventoryApp.id,
      },
    ] as MenuItem[];
  }

  @action openAppLinkInNewTab(ev: Event) {
    ev.stopPropagation();
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
    'Storeknox::FakeApps::FakeAppDetails::Header': typeof StoreknoxFakeAppsFakeAppDetailsHeaderComponent;
  }
}

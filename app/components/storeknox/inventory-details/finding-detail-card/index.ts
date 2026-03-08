import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkFakeAppModel from 'irene/models/sk-fake-app';

export interface FindingDetail {
  id?: string;
  overallScore?: number;
  semanticScore?: number;
  packageScore?: number;
  logoScore?: number;
  developerScore?: number;
  appLogoUrl?: string;
  appName?: string;
  namespace?: string;
  isAndroid?: boolean;
  developer?: string;
  isIgnored?: boolean;
}

export interface StoreknoxInventoryDetailsFindingDetailCardSignature {
  Element: HTMLDivElement;
  Args: {
    finding: FindingDetail;
    fakeApp: SkFakeAppModel;
    skInventoryApp: SkInventoryAppModel;
    reloadFakeApps: () => void;
  };
}

export default class StoreknoxInventoryDetailsFindingDetailCardComponent extends Component<StoreknoxInventoryDetailsFindingDetailCardSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked showIgnoreDrawer = false;
  @tracked addToInventory = false;

  get fakeAppIsIgnored() {
    return this.args.fakeApp.isIgnored;
  }

  get scoreItems() {
    return [
      {
        id: 'semantic',
        label: this.intl.t('storeknox.fakeApps.findingDetailCard.semantic'),
        value: this.args.finding.semanticScore,
      },
      {
        id: 'package',
        label: this.intl.t('storeknox.fakeApps.findingDetailCard.package'),
        value: this.args.finding.packageScore,
      },
      {
        id: 'logo',
        label: this.intl.t('storeknox.fakeApps.findingDetailCard.logo'),
        value: this.args.finding.logoScore,
      },
      {
        id: 'developer',
        label: this.intl.t('storeknox.fakeApps.findingDetailCard.developer'),
        value: this.args.finding.developerScore,
      },
    ];
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('storeknox.fakeApps.ignore'),
        onClick: () => this.openIgnoreDrawer(false),
        divider: true,
      },
      {
        label: this.intl.t('storeknox.fakeApps.ignoreAndAddToInventory'),
        onClick: () => this.openIgnoreDrawer(true),
      },
    ];
  }

  @action
  openIgnoreDrawer(addToInventory = false) {
    this.showIgnoreDrawer = true;
    this.addToInventory = addToInventory;

    this.handleCloseMenu();
  }

  @action
  closeIgnoreDrawer(reloadFakeApps?: boolean) {
    debugger;

    if (reloadFakeApps) {
      this.args.reloadFakeApps();
    }

    this.showIgnoreDrawer = false;
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
    'Storeknox::InventoryDetails::FindingDetailCard': typeof StoreknoxInventoryDetailsFindingDetailCardComponent;
  }
}

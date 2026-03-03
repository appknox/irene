import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

export interface FindingDetail {
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

export interface StoreknoxFakeAppsFindingDetailCardSignature {
  Element: HTMLDivElement;
  Args: {
    finding: FindingDetail;
    onViewMore: () => void;
  };
}

export default class StoreknoxFakeAppsFindingDetailCardComponent extends Component<StoreknoxFakeAppsFindingDetailCardSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  noop() {}

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
        onClick: this.noop,
        divider: true,
      },
      {
        label: this.intl.t('storeknox.fakeApps.ignoreAndAddToInventory'),
        onClick: this.noop,
      },
    ];
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
    'Storeknox::FakeApps::FindingDetailCard': typeof StoreknoxFakeAppsFindingDetailCardComponent;
  }
}

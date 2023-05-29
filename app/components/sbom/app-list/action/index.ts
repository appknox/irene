import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import { AkIconSignature } from 'irene/components/ak-icon';
import SbomAppModel from 'irene/models/sbom-app';
import { SbomScanStatus } from 'irene/models/sbom-scan';

export interface SbomAppListActionSignature {
  Args: {
    sbomApp: SbomAppModel;
    onViewReportClick: (sbomApp: SbomAppModel) => void;
  };
}

type MenuItem = {
  label: string;
  icon: string;
  iconVariant?: AkIconSignature['Args']['variant'];
  divider?: boolean;
  button?: boolean;
  link?: boolean;
  route?: string;
  model?: string;
  onClick?: () => void;
  hidden?: boolean;
};

export default class SbomAppListActionComponent extends Component<SbomAppListActionSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get hasNoSbomScan() {
    return this.args.sbomApp.latestSbFile?.content === null;
  }

  get scanStatusCompleted() {
    return (
      this.args.sbomApp.latestSbFile?.get('status') === SbomScanStatus.COMPLETED
    );
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('sbomModule.pastSbomAnalyses'),
        icon: 'view-list',
        button: false,
        link: true,
        route: 'authenticated.dashboard.sbom.app-scans',
        model: this.args.sbomApp.id,
        divider: this.scanStatusCompleted,
      },
      {
        label: this.intl.t('sbomModule.viewReport'),
        icon: 'description',
        iconVariant: 'outlined',
        button: true,
        onClick: this.handleViewReportClick,
        hidden: !this.scanStatusCompleted,
      },
    ] as MenuItem[];
  }

  @action
  handleViewReportClick() {
    this.args.onViewReportClick(this.args.sbomApp);
    this.handleCloseMenu();
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
    'Sbom::AppList::Action': typeof SbomAppListActionComponent;
    'sbom/app-list/action': typeof SbomAppListActionComponent;
  }
}

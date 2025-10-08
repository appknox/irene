import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import { isEmpty } from '@ember/utils';

import SbomProjectModel from 'irene/models/sbom-project';
import { SbomScanStatus } from 'irene/models/sbom-file';

export interface SbomProjectListActionSignature {
  Args: {
    sbomProject: SbomProjectModel;
    onViewReportClick: (sbomProject: SbomProjectModel) => void;
  };
}

type MenuItem = {
  label: string;
  icon: 'view-list' | 'description-outline';
  divider?: boolean;
  button?: boolean;
  link?: boolean;
  route?: string;
  model?: string;
  onClick?: () => void;
  hidden?: boolean;
};

export default class SbomProjectListActionComponent extends Component<SbomProjectListActionSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get hasNoSbomScan() {
    return isEmpty(this.args.sbomProject.latestSbFile?.get('id'));
  }

  get scanStatusCompleted() {
    return (
      this.args.sbomProject.latestSbFile?.get('status') ===
      SbomScanStatus.COMPLETED
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
        model: this.args.sbomProject.id,
        divider: this.scanStatusCompleted,
      },
      {
        label: this.intl.t('sbomModule.viewReport'),
        icon: 'description-outline',
        button: true,
        onClick: this.handleViewReportClick,
        hidden: !this.scanStatusCompleted,
      },
    ] as MenuItem[];
  }

  @action
  handleViewReportClick() {
    this.args.onViewReportClick(this.args.sbomProject);
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
    'Sbom::AppList::Action': typeof SbomProjectListActionComponent;
    'sbom/app-list/action': typeof SbomProjectListActionComponent;
  }
}

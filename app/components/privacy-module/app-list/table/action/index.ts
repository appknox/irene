import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import { AkIconSignature } from 'irene/components/ak-icon';
import PrivacyProjectModel, {
  PrivacyStatus,
} from 'irene/models/privacy-project';

export interface PrivacyModuleAppListTableActionSignature {
  Args: {
    privacyProject: PrivacyProjectModel;
    onViewReportClick: (privacyProject: PrivacyProjectModel) => void;
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

export default class PrivacyModuleAppListTableActionComponent extends Component<PrivacyModuleAppListTableActionSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get fileId() {
    return this.args.privacyProject?.latestFile.get('id');
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('privacyModule.viewScanDetails'),
        icon: 'open-in-new',
        button: false,
        link: true,
        route: 'authenticated.dashboard.file',
        model: this.fileId,
        divider: this.statusCompleted,
      },
      {
        label: this.intl.t('viewReport'),
        icon: 'description',
        iconVariant: 'outlined',
        button: true,
        onClick: this.handleViewReportClick,
        hidden: !this.statusCompleted,
      },
    ] as MenuItem[];
  }

  get statusCompleted() {
    return (
      this.args.privacyProject.latestFilePrivacyAnalysisStatus ===
      PrivacyStatus.COMPLETED
    );
  }

  @action
  handleViewReportClick() {
    this.args.onViewReportClick(this.args.privacyProject);

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
    'privacy-module/app-list/table/action': typeof PrivacyModuleAppListTableActionComponent;
  }
}

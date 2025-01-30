import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import { AkIconSignature } from 'irene/components/ak-icon';
import PrivacyProjectModel from 'irene/models/privacy-project';
import SbomProjectModel from 'irene/models/sbom-project';

export interface PrivacyModuleAppListTableActionSignature {
  Args: {
    privacyProject: PrivacyProjectModel;
    onViewReportClick: (sbomProject: SbomProjectModel) => void;
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
        label: 'View Scan Details',
        icon: 'open-in-new',
        button: false,
        link: true,
        route: 'authenticated.dashboard.file',
        model: this.fileId,
      },
    ] as MenuItem[];
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

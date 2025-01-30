import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import { AkIconSignature } from 'irene/components/ak-icon';
import SbomProjectModel from 'irene/models/sbom-project';

export interface PrivacyModuleAppListTableActionSignature {
  Args: {
    sbomProject: SbomProjectModel;
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

  get menuItems() {
    return [
      {
        label: this.intl.t('sbomModule.pastSbomAnalyses'),
        icon: 'view-list',
        button: true,
        divider: true,
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

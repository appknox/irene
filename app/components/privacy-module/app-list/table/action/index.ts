import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type PrivacyProjectModel from 'irene/models/privacy-project';

export interface PrivacyModuleAppListTableActionSignature {
  Args: {
    privacyProject: PrivacyProjectModel;
    onViewReportClick: (privacyProject: PrivacyProjectModel) => void;
  };
}

export default class PrivacyModuleAppListTableActionComponent extends Component<PrivacyModuleAppListTableActionSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get fileId() {
    return this.args.privacyProject?.latestFile.get('id');
  }

  get statusCompleted() {
    return (
      this.args.privacyProject.latestFilePrivacyAnalysisStatus ===
      ENUMS.PM_STATUS.COMPLETED
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

import Component from '@glimmer/component';
import { service } from '@ember/service';

import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';
import type OrganizationService from 'irene/services/organization';
import type { KnoxIqProjectCardAccent } from 'irene/components/knox-iq/project-card';

interface AppFileCardSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    isSelectedFile?: boolean;
    onFileSelect?: (file: FileModel | null) => void;
    showCheckbox?: boolean;
    disableCheckbox?: boolean;
    showMenuButton?: boolean;
    hideOpenInNewTabIcon?: boolean;
    hideCTAs?: boolean;
    showOpenInNewTab?: boolean;
    accentColor?: KnoxIqProjectCardAccent;
    showRunKnoxIq?: boolean;
  };
}

export default class AppFileCardComponent extends Component<AppFileCardSignature> {
  @service declare organization: OrganizationService;

  // True when the file belongs to an org other than the viewer's selected org
  get isOutOfOrgFile() {
    const project = this.args.file
      ?.belongsTo('project')
      .value() as ProjectModel | null;

    const fileOrgId = project?.belongsTo('organization').id();
    const selectedOrgId = this.organization.selected?.id;

    return Boolean(fileOrgId && selectedOrgId && fileOrgId !== selectedOrgId);
  }

  get isKnoxIqEnabled() {
    // KnoxIQ details for another org's file (e.g. a superuser browsing a
    // client project) are shown only on the file details page, never here.
    if (this.isOutOfOrgFile) {
      return false;
    }

    return this.organization.isKnoxIqEnabled;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppFileCard: typeof AppFileCardComponent;
  }
}

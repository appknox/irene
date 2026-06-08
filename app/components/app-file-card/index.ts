import Component from '@glimmer/component';
import { service } from '@ember/service';

import type FileModel from 'irene/models/file';
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

  get isKnoxIqEnabled() {
    return this.organization.isKnoxIqEnabled;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppFileCard: typeof AppFileCardComponent;
  }
}

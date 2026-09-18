import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';
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
  // The file's own is_knoxiq_enabled, not the viewer's selected org's flag:
  // the backend already resolved this (org flag on, or superuser bypass) for
  // the request that fetched this file, so trust it instead of re-deriving
  // it from an org record the viewer may not even have loaded (e.g. a
  // superuser browsing a different org's project).
  get isKnoxIqEnabled() {
    return Boolean(this.args.file?.isKnoxiqEnabled);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppFileCard: typeof AppFileCardComponent;
  }
}

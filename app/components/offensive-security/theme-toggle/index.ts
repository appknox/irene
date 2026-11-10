import Component from '@glimmer/component';
import { service } from '@ember/service';

import type OffsecThemeService from 'irene/services/offsec-theme';

export interface OffensiveSecurityThemeToggleSignature {
  Args: {
    buttonClass?: string;
  };
}

export default class OffensiveSecurityThemeToggleComponent extends Component<OffensiveSecurityThemeToggleSignature> {
  @service declare offsecTheme: OffsecThemeService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ThemeToggle': typeof OffensiveSecurityThemeToggleComponent;
  }
}

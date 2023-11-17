import Component from '@glimmer/component';
import SecurityProjectModel from 'irene/models/security/project';

export interface SecurityProjectSearchOverviewSignature {
  Element: HTMLElement;
  Args: {
    project: SecurityProjectModel;
  };
}

export default class SecurityProjectSearchOverviewComponent extends Component<SecurityProjectSearchOverviewSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ProjectSearchOverview': typeof SecurityProjectSearchOverviewComponent;
  }
}

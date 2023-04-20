import Component from '@glimmer/component';

import UserModel from 'irene/models/user';

export interface HomePageOrganizationDashboardSignature {
  Args: {
    logoutAction: () => void;
    isSecurityEnabled?: boolean;
    user: UserModel;
  };

  Blocks: {
    default: [];
  };
}

export default class HomePageOrganizationDashboardComponent extends Component<HomePageOrganizationDashboardSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::OrganizationDashboard': typeof HomePageOrganizationDashboardComponent;
  }
}

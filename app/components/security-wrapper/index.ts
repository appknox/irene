import Component from '@glimmer/component';

import type UserModel from 'irene/models/user';

export interface SecurityWrapperSignature {
  Args: {
    user: UserModel;
  };

  Blocks: {
    default: [];
  };
}

export default class SecurityWrapperComponent extends Component<SecurityWrapperSignature> {
  get menuItems() {
    return [
      {
        id: 'projects',
        route: 'authenticated.security.projects',
        label: 'Projects',
        currentWhen:
          'authenticated.security.projects authenticated.security.files authenticated.security.file',
      },
      {
        id: 'downloadapp',
        route: 'authenticated.security.downloadapp',
        label: 'Download App',
        currentWhen: 'authenticated.security.downloadapp',
      },
      {
        id: 'purgeanalysis',
        route: 'authenticated.security.purgeanalysis',
        label: 'Purge API Analyses',
        currentWhen: 'authenticated.security.purgeanalysis',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SecurityWrapper: typeof SecurityWrapperComponent;
  }
}

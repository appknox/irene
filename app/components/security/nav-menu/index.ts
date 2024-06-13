import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import RouterService from '@ember/routing/router-service';

export interface SecurityNavMenuSignature {
  Blocks: { default: [] };
}

export default class SecurityNavMenuComponent extends Component<SecurityNavMenuSignature> {
  @service declare router: RouterService;

  get currentRoute() {
    return this.router.currentRouteName;
  }

  get menuItems() {
    return [
      {
        id: 'projects',
        route: 'authenticated.security.projects',
        label: 'Projects',
        currentWhen:
          'authenticated.security.projects authenticated.security.files authenticated.security.file authenticated.security.analysis',
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
    'Security::NavMenu': typeof SecurityNavMenuComponent;
  }
}

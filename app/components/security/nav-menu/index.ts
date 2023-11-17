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
        route: 'authenticated.security.projects',
        label: 'Projects',
        isActive: [
          'authenticated.security.projects',
          'authenticated.security.files',
          'authenticated.security.file',
        ].includes(this.currentRoute),
      },
      {
        route: 'authenticated.security.downloadapp',
        label: 'Download App',
        isActive: this.currentRoute === 'authenticated.security.downloadapp',
      },
      {
        route: 'authenticated.security.purgeanalysis',
        label: 'Purge API Analyses',
        isActive: this.currentRoute === 'authenticated.security.purgeanalysis',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::NavMenu': typeof SecurityNavMenuComponent;
  }
}

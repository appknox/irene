import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import Router from 'irene/router';
import OrganizationService from 'irene/services/organization';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export interface LandingPageComponentSignature {
  Element: HTMLElement;
  Blocks: {
    default: [];
  };
}

export default class LandingPageComponent extends Component<LandingPageComponentSignature> {
  @service declare router: Router;
  @service declare organization: OrganizationService;
  @service declare session: any;

  get isStoreknoxEnabled() {
    return this.organization.selected?.features.app_monitoring;
  }

  @action invalidateSession() {
    triggerAnalytics('logout', {} as CsbAnalyticsData);
    this.session.invalidate();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    LandingPage: typeof LandingPageComponent;
  }
}

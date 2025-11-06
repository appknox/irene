import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { all } from 'rsvp';
import type Transition from '@ember/routing/transition';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import { CSBMap } from 'irene/router';
import ENV from 'irene/config/environment';
import {
  registerPostHogOrganization,
  unregisterPostHog,
} from 'irene/utils/posthog';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import type MeService from 'irene/services/me';
import type DatetimeService from 'irene/services/datetime';
import type TrialService from 'irene/services/trial';
import type IntegrationService from 'irene/services/integration';
import type OrganizationService from 'irene/services/organization';
import type ConfigurationService from 'irene/services/configuration';
import type SkOrganizationService from 'irene/services/sk-organization';
import type WebsocketService from 'irene/services/websocket';
import type UserModel from 'irene/models/user';
import type LoggerService from 'irene/services/logger';

export default class AuthenticatedRoute extends Route {
  @service declare session: any;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare datetime: DatetimeService;
  @service declare trial: TrialService;
  @service declare rollbar: any;
  @service declare websocket: WebsocketService;
  @service declare integration: IntegrationService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('organization') declare org: OrganizationService;
  @service declare configuration: ConfigurationService;
  @service declare skOrganization: SkOrganizationService;
  @service declare logger: LoggerService;

  @service declare router: RouterService;
  @service('browser/window') declare window: Window;

  constructor(properties?: object) {
    super(properties);

    this.monitorLastTransition();
  }

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, () => {
      // Don't save authenticated index route if user is not authenticated
      if (transition.targetName !== 'authenticated.index') {
        this.saveTransitionedURL();
      }

      this.router.transitionTo('login');
    });
  }

  async model() {
    const userId = this.session.data.authenticated.user_id;

    await all([
      this.store.findAll('Vulnerability'),
      this.org.load(),
      this.configuration.getDashboardConfig(),
    ]);

    // Gracefully load sk organization if it's enabled
    try {
      await this.skOrganization.load();
    } catch (error) {
      this.logger.info('No Storeknox Organization found');
    }

    return await this.store.findRecord('user', userId);
  }

  async afterModel(user: UserModel) {
    const company =
      this.org.selected?.name ||
      user.email.replace(/.{1,255}@/, '').split('.')[0];

    const membership = await this.me.getMembership();

    const data = {
      userId: user.id,
      userName: user.username,
      userEmail: user.email,
      userRole: membership.roleDisplay,
      lastLoggedIn: membership.lastLoggedIn,
      accountId: this.org.selected?.id,
      accountName: company,
    };

    triggerAnalytics('login', data as CsbAnalyticsLoginData);

    await this.integration.configure(user);

    await this.configureRollBar(user);
    await this.configurePendo(user);

    this.trial.set('isTrial', user.isTrial);

    this.notify.setDefaultAutoClear(ENV.notifications.autoClear);

    this.intl.setLocale(user.lang);

    this.datetime.setLocale(user.lang);

    await this.websocket.configure(user);

    registerPostHogOrganization(user, this.org.selected);
  }

  async configureRollBar(user: UserModel) {
    try {
      this.rollbar.notifier.configure({
        payload: {
          person: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  async configurePendo(user: UserModel) {
    try {
      // @ts-expect-error global pendo
      pendo.initialize({
        visitor: {
          id: user.id,
          email: user.email,
        },
        account: {
          id: user.email.split('@').pop()?.trim(),
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  @action
  willTransition(transition: Transition) {
    const currentRoute = transition.to?.name as keyof typeof CSBMap;
    const csbDict = CSBMap[currentRoute];

    if (!isEmpty(csbDict)) {
      triggerAnalytics('feature', csbDict as CsbAnalyticsFeatureData);
    }
  }

  @action
  invalidateSession() {
    triggerAnalytics('logout', {} as CsbAnalyticsData);
    unregisterPostHog();

    this.session.invalidate();
  }

  @action saveTransitionedURL() {
    const { pathname, search } = this.window.location;

    let transitionData = {
      url: pathname + search,
    } as { url: string; sessionKey?: number };

    /* Save session key if user is logged in.
     * Necessary to take a decision whether to resume transition or not
     * in the event that the logged in account is switched.
     */
    if (this.session.isAuthenticated) {
      const sessionKey = this.session.data.authenticated.user_id as number;
      transitionData = { ...transitionData, sessionKey };
    }

    this.window.sessionStorage.setItem(
      `_lastTransitionInfo`,
      JSON.stringify(transitionData)
    );
  }

  // Save last transitioned route
  @action
  saveLastTransition(transition: Transition) {
    if (transition.targetName?.includes('authenticated')) {
      this.saveTransitionedURL();
    }
  }

  @action
  monitorLastTransition() {
    this.router.on('routeDidChange', this.saveLastTransition);
  }

  @action
  willDestroy() {
    super.willDestroy();

    this.router.off('routeDidChange', this.saveLastTransition);
  }
}

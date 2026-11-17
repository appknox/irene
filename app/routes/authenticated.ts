import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { all } from 'rsvp';
import type Transition from '@ember/routing/transition';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import type { SessionService } from 'irene/adapters/auth-base';
import type AnalyticsService from 'irene/services/analytics';
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
  @service declare session: SessionService;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare datetime: DatetimeService;
  @service declare trial: TrialService;
  @service declare websocket: WebsocketService;
  @service declare integration: IntegrationService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('organization') declare org: OrganizationService;
  @service declare configuration: ConfigurationService;
  @service declare skOrganization: SkOrganizationService;
  @service declare logger: LoggerService;
  @service declare analytics: AnalyticsService;

  @service declare router: RouterService;
  @service('browser/window') declare window: Window;

  constructor(properties?: object) {
    super(properties);

    this.monitorLastTransition();
  }

  get authenticatedUserId() {
    return this.session.data.authenticated.user_id;
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
    const userId = this.authenticatedUserId;

    // These loads do not depend on each other, so start them together.
    // The vulnerability list must be loaded before the page renders (analysis
    // rows read it). The Storeknox organization is optional.
    // NOTE: nothing here touches the `me` service on purpose: the Storeknox
    // org check reads `me.org`, and starting `me` earlier would change its result.
    const skOrganizationPromise = this.skOrganization
      .load()
      .catch(() => this.logger.info('No Storeknox Organization found'));

    const [, , , user] = await all([
      this.store.findAll('vulnerability'),
      this.org.load(),
      this.configuration.getDashboardConfig(),
      this.store.findRecord('user', userId),
      skOrganizationPromise,
    ]);

    return user as UserModel;
  }

  async afterModel(user: UserModel) {
    const company =
      this.org.selected?.name ||
      user.email.replace(/.{1,255}@/, '').split('.')[0];

    // Child routes read `me.org` synchronously in their guards, so the
    // organization "me" record must be loaded before the page renders.
    await this.me.fetchOrganizationMe();

    // The membership record is only used for the login analytics event.
    // getMembership() reuses the loaded "me" record, so start it now and
    // send the event when it arrives, instead of holding the page for it.
    const membershipPromise = this.me.getMembership();

    // Support widget set-up (config call + token call) is not needed to draw
    // the page, so it runs in the background. Failures were route errors
    // before; they are logged now.
    this.integration.configure(user).catch((error: unknown) => {
      this.logger.error('Support widget configuration failed', error);
    });

    await this.configurePendo(user);

    this.trial.set('isTrial', user.isTrial);

    this.notify.setDefaultAutoClear(ENV.notifications.autoClear);

    this.intl.setLocale(user.lang);

    this.datetime.setLocale(user.lang);

    await this.websocket.configure(user);

    this.analytics.registerPostHogOrganization(user, this.org.selected);

    membershipPromise
      .then((membership) => {
        this.analytics.track({
          name: 'LOGIN_EVENT',
          properties: {
            userId: user.id,
            userName: user.username,
            userEmail: user.email,
            userRole: membership.roleDisplay,
            lastLoggedIn: membership.lastLoggedIn,
            accountId: this.org.selected?.id,
            accountName: company,
          },
        });
      })
      .catch((error: unknown) => {
        this.logger.warn('Analytics: failed to send login event', error);
      });
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
      this.logger.info('Pendo configure failed', e);
    }
  }

  @action
  willTransition(transition: Transition) {
    try {
      const routeName =
        transition.to?.name || transition.to?.localName || 'unknown';

      const params = transition?.to?.params || {};
      const queryParams = transition?.to?.queryParams ?? {};

      this.analytics.page(routeName, {
        routeName,
        params,
        queryParams,
      });
    } catch (err) {
      this.logger.warn('Analytics: failed to track route transition', err);
    }
  }

  /**
   * Track logout, unregister analytics, then invalidate session.
   */
  @action
  invalidateSession() {
    try {
      this.analytics.track({
        name: 'LOGOUT_EVENT',
        properties: {},
      });

      this.analytics.unregister();
    } catch (err) {
      this.logger.warn('analytics: failed to unregister', err);
    }

    this.session?.invalidate?.();
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
      const sessionKey = this.authenticatedUserId;
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

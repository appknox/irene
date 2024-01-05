import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import Transition from '@ember/routing/transition';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import { all } from 'rsvp';

import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import DatetimeService from 'irene/services/datetime';
import TrialService from 'irene/services/trial';
import IntegrationService from 'irene/services/integration';
import OrganizationService from 'irene/services/organization';
import UserModel from 'irene/models/user';
import { CSBMap } from 'irene/router';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import * as chat from 'irene/utils/chat';

export default class AuthenticatedRoute extends Route {
  @service declare session: any;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare datetime: DatetimeService;
  @service declare trial: TrialService;
  @service declare rollbar: any;
  @service declare websocket: any;
  @service declare integration: IntegrationService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('organization') declare org: OrganizationService;

  @tracked lastTransition?: Transition;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'login');

    this.lastTransition = transition;
  }

  async model() {
    const userId = this.session.data.authenticated.user_id;

    await all([this.store.findAll('Vulnerability'), this.org.load()]);

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

    chat.setUserEmail(user.email, user.crispHash);
    chat.setUserCompany(company || '');

    await this.configureRollBar(user);
    await this.configurePendo(user);

    this.trial.set('isTrial', user.isTrial);

    this.notify.setDefaultAutoClear(ENV.notifications.autoClear);

    this.intl.setLocale(user.lang);

    this.datetime.setLocale(user.lang);

    await this.websocket.configure(user);
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
    const currentRoute = transition.to.name as keyof typeof CSBMap;
    const csbDict = CSBMap[currentRoute];

    if (!isEmpty(csbDict)) {
      triggerAnalytics('feature', csbDict as CsbAnalyticsFeatureData);
    }
  }

  @action
  invalidateSession() {
    triggerAnalytics('logout', {} as CsbAnalyticsData);

    this.session.invalidate();
  }
}

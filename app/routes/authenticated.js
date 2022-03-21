/* eslint-disable ember/classic-decorator-no-classic-methods, ember/no-get */
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { CSBMap } from 'irene/router';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import * as chat from 'irene/utils/chat';

import { all } from 'rsvp';

export default class AuthenticatedRoute extends Route {
  @service session;
  @service intl;
  @service me;
  @service datetime;
  @service session;
  @service trial;
  @service rollbar;
  @service websocket;
  @service integration;

  @service('organization') org;
  @service('socket-io') socketIOService;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    this.set('lastTransition', transition);
  }

  async model() {
    const userId = this.session.data.authenticated.user_id;
    await all([this.store.findAll('Vulnerability'), this.org.load()]);
    return this.store.find('user', userId);
  }

  async afterModel(user) {
    const company =
      this.get('org.selected.data.name') ||
      user.get('email').replace(/.*@/, '').split('.')[0];
    const membership = await this.me.getMembership();
    const data = {
      userId: user.get('id'),
      userName: user.get('username'),
      userEmail: user.get('email'),
      userRole: membership.get('roleDisplay'),
      accountId: this.get('org.selected.id'),
      accountName: company,
    };
    triggerAnalytics('login', data);
    await this.integration.configure(user);
    chat.setUserEmail(user.get('email'), user.get('crispHash'));
    chat.setUserCompany(company);
    await this.configureRollBar(user);
    await this.configurePendo(user);

    const trial = this.get('trial');
    trial.set('isTrial', user.get('isTrial'));

    this.get('notify').setDefaultAutoClear(ENV.notifications.autoClear);
    this.set('intl.locale', user.get('lang'));
    this.get('datetime').setLocale(user.get('lang'));

    await this.websocket.configure(user);
  }

  async configureRollBar(user) {
    try {
      this.rollbar.notifier.configure({
        payload: {
          person: {
            id: user.get('id'),
            username: user.get('username'),
            email: user.get('email'),
          },
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  async configurePendo(user) {
    try {
      // eslint-disable-next-line no-undef
      pendo.initialize({
        visitor: {
          id: user.get('id'),
          email: user.get('email'),
        },
        account: {
          id: user.get('email').split('@').pop().trim(),
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  @action
  willTransition(transition) {
    const currentRoute = transition.targetName;
    const csbDict = CSBMap[currentRoute];
    if (!isEmpty(csbDict)) {
      triggerAnalytics('feature', csbDict);
    }
  }

  @action
  invalidateSession() {
    triggerAnalytics('logout');
    this.session.invalidate();
  }
}

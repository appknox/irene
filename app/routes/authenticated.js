import {
  inject as service
} from '@ember/service';
import {
  isEmpty
} from '@ember/utils';
import Route from '@ember/routing/route';
import {
  action
} from '@ember/object';
import {
  singularize
} from 'ember-inflector';
import {
  debug
} from '@ember/debug';
import {
  getOwner
} from '@ember/application';

import ENUMS from 'irene/enums';
import {
  CSBMap
} from 'irene/router';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import * as chat from 'irene/utils/chat';

import { all } from 'rsvp';

const {
  location
} = window;

export default class AuthenticatedRoute extends Route {
  @service session;
  @service intl;
  @service me;
  @service datetime;
  @service session;
  @service realtime;
  @service trial;
  @service rollbar;
  @service('organization') org;
  @service('socket-io') socketIOService;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    this.set("lastTransition", transition);
  }

  async model() {
    const userId = this.session.data.authenticated.user_id;
    await all([
      this.store.findAll('Vulnerability'),
      this.org.load(),
    ]);
    return this.store.find('user', userId);
  }

  async afterModel(user) {
    const company =
      this.get("org.selected.data.name") ||
      user.get("email").replace(/.*@/, "").split('.')[0];
    const membership = await this.get('me.membership');
    const data = {
      userId: user.get("id"),
      userName: user.get("username"),
      userEmail: user.get("email"),
      userRole: membership.get('roleDisplay'),
      accountId: this.get("org.selected.id"),
      accountName: company
    };
    triggerAnalytics('login', data);
    chat.setUserEmail(user.get("email"), user.get("crispHash"));
    chat.setUserCompany(company);
    await this.configureRollBar(user);
    await this.configurePendo(user);

    const trial = this.get("trial");
    trial.set("isTrial", user.get("isTrial"));

    this.get('notify').setDefaultAutoClear(ENV.notifications.autoClear);
    this.set('intl.locale', user.get("lang"));
    this.get('datetime').setLocale(user.get("lang"));

    await this.configureSocket(user);
  }

  async configureSocket(user) {
    const socketId = user != null ? user.get("socketId") : undefined;
    if (isEmpty(socketId)) {
      return;
    }
    const that = this;
    const store = this.get("store");
    const realtime = this.get("realtime");
    const owner = getOwner(store);
    const allEvents = {
      object(data) {
        if (data.id && data.type) {
          try {
            var modelName = singularize(data.type);
            if (!owner.factoryFor(`model:${modelName}`)) {
              return
            }
            store.findRecord(modelName, data.id);
          } catch (e) {
            debug(e);
          }
        }
        debug(JSON.stringify(data));
        store.pushPayload({
          data
        });
      },
      newobject(data) {
        if (data.id && data.type) {
          try {
            var modelName = singularize(data.type);
            if (!owner.factoryFor(`model:${modelName}`)) {
              return
            }
            store.findRecord(modelName, data.id);
          } catch (e) {
            debug(e);
          }
        }
        debug(JSON.stringify(data));
        store.pushPayload({
          data
        });
      },
      message(data) {
        const {
          message
        } = data;
        const {
          notifyType
        } = data;
        if (notifyType === ENUMS.NOTIFY.INFO) {
          that.get("notify").info(message, ENV.notifications);
        }
        if (notifyType === ENUMS.NOTIFY.SUCCESS) {
          that.get("notify").success(message, ENV.notifications);
        }
        if (notifyType === ENUMS.NOTIFY.WARNING) {
          that.get("notify").warning(message, ENV.notifications);
        }
        if (notifyType === ENUMS.NOTIFY.ALERT) {
          that.get("notify").alert(message, ENV.notifications);
        }
        if (notifyType === ENUMS.NOTIFY.ERROR) {
          that.get("notify").error(message, {
            autoClear: false
          });
        }
      },

      logout() {
        triggerAnalytics('logout');
        this.session.invalidate();
      },

      reload() {
        location.reload();
      },

      counter(data) {
        realtime.incrementProperty(`${data.type}Counter`);
      },

      namespace(data) {
        realtime.set("namespace", data.namespace);
      }
    };
    const socket = this.socketIOService.socketFor(ENV.socketPath, {
      path: '/websocket'
    });
    for (let key in allEvents) {
      const value = allEvents[key];
      socket.on(key, value);
    }
    socket.on('connect', () => {
      debug("Connecting to room: " + socketId);
      socket.emit("subscribe", {
        room: socketId
      });
    });
  }

  async configureRollBar(user) {
    try {
      this.rollbar.notifier.configure({
        payload: {
          person: {
            id: user.get("id"),
            username: user.get("username"),
            email: user.get("email")
          }
        }
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
          id: user.get("id"),
          email: user.get("email")
        },
        account: {
          id: user.get("email").split("@").pop().trim()
        }
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

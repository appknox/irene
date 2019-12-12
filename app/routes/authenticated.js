import { singularize } from 'ember-inflector';
import { debug } from '@ember/debug';

import ENUMS from 'irene/enums';
import { CSBMap } from 'irene/router';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import * as chat from 'irene/utils/chat';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';


const { location } = window;

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';

const AuthenticatedRoute = Route.extend(AuthenticatedRouteMixin, {

  lastTransition: null,
  intl: service(),
  moment: service(),
  session: service(),
  realtime: service(),
  trial: service(),
  org: service('organization'),
  analytics: service('analytics'),
  socketIOService: service('socket-io'),
  rollbar: service('rollbar'),

  beforeModel(transition){
    this.set("lastTransition", transition);
    return this._super(transition);
  },

  async model() {
    const userId = this.get("session.data.authenticated.user_id");
    await this.get('store').findAll('Vulnerability');
    await this.get('org').load();
    await this.get('analytics').load();
    return this.get('store').find('user', userId);
  },

  afterModel(user){
    let error;
    const company =
        this.get("org.selected.data.name") ||
        user.get("email").replace(/.*@/, "").split('.')[0];
    const data = {
      userId: user.get("id"),
      userName: user.get("username"),
      userEmail: user.get("email"),
      accountId: this.get("org.selected.id"),
      accountName: company
    };
    triggerAnalytics('login', data);
    chat.setUserEmail(user.get("email"), user.get("crispHash"));
    
    chat.setUserCompany(company);

    try {
      // eslint-disable-next-line no-undef
      this.get('rollbar.notifier').configure({
        payload: {
          person: {
            id: user.get("id"),
            username: user.get("username"),
            email: user.get("email")
          }
        }
      });
    } catch (e) { error = e; }
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

    } catch (e) { error = e; }
    // eslint-disable-next-line no-console
    console.log(error);

    const trial = this.get("trial");
    trial.set("isTrial", user.get("isTrial"));

    this.get('notify').setDefaultAutoClear(ENV.notifications.autoClear);

    const socketId = user != null ? user.get("socketId") : undefined;
    if (isEmpty(socketId)) {
      return;
    }
    this.set('intl.locale', user.get("lang"));
    this.get('moment').changeLocale(user.get("lang"));

    const that = this;
    const store = this.get("store");
    const realtime = this.get("realtime");

    const allEvents = {
      object(data) {
        if(data.id && data.type) {
          try {
            var modelName = singularize(data.type);
            store.findRecord(modelName, data.id);
          } catch (e) {
            debug(e);
          }
        }
        debug(data);
        store.pushPayload({data});
      },
      newobject(data) {
        if(data.id && data.type) {
          try {
            var modelName = singularize(data.type);
            store.findRecord(modelName, data.id);
          } catch (e) {
            debug(e);
          }
        }
        debug(data);
        store.pushPayload({data});
      },
      message(data) {
        const { message } = data;
        const { notifyType } = data;
        if (notifyType === ENUMS.NOTIFY.INFO) { that.get("notify").info(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.SUCCESS) { that.get("notify").success(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.WARNING) { that.get("notify").warning(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.ALERT) { that.get("notify").alert(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.ERROR) { that.get("notify").error(message, {
          autoClear: false
        }); }
      },

      logout() {
        triggerAnalytics('logout');
        this.get('session').invalidate();
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

    const socket = this.get('socketIOService').socketFor(ENV.socketPath);

    socket.emit("subscribe", {room: socketId});
    return (() => {
      const result = [];
      for (let key in allEvents) {
        const value = allEvents[key];
        result.push(socket.on(key, value));
      }
      return result;
    })();
  },

  actions: {

    willTransition(transition) {
      const currentRoute = transition.targetName;
      const csbDict = CSBMap[currentRoute];
      if (!isEmpty(csbDict)) {
        triggerAnalytics('feature', csbDict);
      }
    },

    invalidateSession() {
      triggerAnalytics('logout');
      this.get('session').invalidate();
    }
  }
}
);

export default AuthenticatedRoute;

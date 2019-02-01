import ENUMS from 'irene/enums';
import { CSBMap } from 'irene/router';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';


const { location } = window;

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';

const AuthenticatedRoute = Route.extend(AuthenticatedRouteMixin, {

  lastTransition: null,
  i18n: service(),
  moment: service(),
  session: service(),
  realtime: service(),
  mixpanel: service(),
  trial: service(),
  org: service('organization'),
  socketIOService: service('socket-io'),

  beforeModel(transition){
    this.set("lastTransition", transition);
    return this._super(transition);
  },

  async model() {
    const userId = this.get("session.data.authenticated.user_id");
    await this.get('org').load();
    return this.get('store').find('user', userId);
  },

  afterModel(user){
    let error;
    const data = {
      userId: user.get("id"),
      accountId: this.get("org.selected.id")
    };
    triggerAnalytics('login', data);
    try {
       // eslint-disable-next-line no-undef
      $crisp.push([ "set", "user:email", user.get("email")]);
    } catch (e) { error = e; }
    try {
      const mixpanel = this.get("mixpanel");
      mixpanel.identify(user.get("id"));
      mixpanel.peopleSet({
        "$name": user.get("username"),
        "$email": user.get("email")
      });
    } catch (e) {error = e;}
    try {
      // eslint-disable-next-line no-undef
      Rollbar.configure({
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
    this.set('i18n.locale', user.get("lang"));
    this.get('moment').changeLocale(user.get("lang"));

    const that = this;
    const store = this.get("store");
    const realtime = this.get("realtime");

    const allEvents = {

      object(data) {
        store.pushPayload({data});
      },

      newobject(data) {
        store.pushPayload({data});
      },

      message(data) {
        const { message } = data;
        const { notifyType } = data;
        if (notifyType === ENUMS.NOTIFY.INFO) { that.get("notify").info(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.SUCCESS) { that.get("notify").success(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.WARNING) { that.get("notify").warning(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.ALERT) { that.get("notify").alert(message, ENV.notifications); }
        if (notifyType === ENUMS.NOTIFY.ERROR) { that.get("notify").error(message, ENV.notifications); }
      },

      logout() {
        localStorage.clear();
        location.reload();
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

import Ember from 'ember';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const {inject: {service}} = Ember;

export default Ember.Component.extend({
  me: service(),
  i18n: service(),
  ajax: service(),
  session: service(),
  organization: service(),
  socketIOService: service('socket-io'),

  isLoaded: false,
  networkError: "",
  isSecurityEnabled: false,
  isSecurityDashboard: false,

  tSomethingWentWrong: t("somethingWentWrong"),
  tOrganizationNameUpdated: t("organizationNameUpdated"),

  checkConnectivity() {
    const socket = this.get('socketIOService').socketFor(ENV.socketPath);
    const offlineMessage = "No Internet, Please check your internet connection";
    window.addEventListener('offline', () => {
      this.set("networkError", offlineMessage);
    });
    window.addEventListener('online', () => {
      this.set("networkError", "");
    });
    socket.on('connect', () => {
      this.set("networkError", "");
    });
    socket.on('disconnect', () => {
      this.set("networkError", offlineMessage);
    });
  },

  securityEnabled() {
    this.get("ajax").request("projects", {namespace: 'hudson-api'})
    .then(() => {
      this.set("isSecurityEnabled", true);
      this.securityDashboard();
    }, () => {
      this.set("isSecurityEnabled", false);
      this.securityDashboard();
    });
  },

  isEmptyOrganization: Ember.computed("me.org.is_owner", function() {
    const organization = this.get("organization");
    const isOwner = this.get("me.org.is_owner")
    if(isOwner) {
      const orgName = organization.selected.get("name");
      if(!orgName) {
        return true;
      }
    }
  }),

  showBilling: Ember.computed(
    'me.org.is_owner', 'organization.selected.showBilling',
    function() {
      const orgShowBilling = this.get('organization.selected.showBilling');
      const isOwner = this.get('me.org.is_owner');
      return orgShowBilling && isOwner;
    }
  ),

  securityDashboard() {
    if(window.location.pathname.startsWith("/security")) {
      const isSecurityEnabled = this.get("isSecurityEnabled");
      if(isSecurityEnabled) {
        this.set("isSecurityDashboard", true);
      }
      else {
        Ember.getOwner(this).lookup('route:authenticated').transitionTo("authenticated.projects");
      }
      this.set("isLoaded", true);
    }
    else {
      this.set("isLoaded", true);
    }
  },

  didInsertElement() {
    this.securityEnabled();
    this.checkConnectivity();
  },

  /* Update org name */
  updateOrgName: task(function * () {
    this.set("isUpdatingOrg", true);
    const org = this.get('organization').selected;
    org.set('name', this.get("organizationName"));
    yield org.save();
  }).evented(),

  updateOrgNameSucceeded: on('updateOrgName:succeeded', function() {
    this.get('notify').success(this.get('tOrganizationNameUpdated'));
    this.set("isEmptyOrganization", false);
    this.set("isUpdatingOrg", false);
  }),

  updateOrgNameErrored: on('updateOrgName:errored', function(_, err) {
    let errMsg = this.get('tSomethingWentWrong');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.set("isUpdatingOrg", false);
    this.get("notify").error(errMsg);
  }),

  actions: {
    invalidateSession() {
      triggerAnalytics('logout');
      this.get('session').invalidate();
    }
  }

});

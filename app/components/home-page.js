import Ember from 'ember';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const {inject: {service}} = Ember;

export default Ember.Component.extend({
  me: service(),
  i18n: service(),
  ajax: service(),
  session: service(),
  organization: service(),

  isLoaded: false,
  isSecurityEnabled: false,
  isSecurityDashboard: false,

  tSomethingWentWrong: t("somethingWentWrong"),
  tOrganizationNameUpdated: t("organizationNameUpdated"),

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
  },

  /* Update org name */
  updateOrgName: task(function * () {
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

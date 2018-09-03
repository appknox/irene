import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const {inject: {service}} = Ember;

export default Ember.Component.extend({
  me: service(),
  ajax: service(),
  session: service(),
  organization: service(),
  i18n: Ember.inject.service(),

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

  checkEmptyOrganization() {
    const organization = this.get("organization");
    const org = this.get("store").peekRecord("organization", organization.selected.id);
    const orgName = org.data.name;
    if(!orgName) {
      this.set("showUpdateOrgModal", true);
    }
  },

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
    this.checkEmptyOrganization();
  },

  actions: {
    invalidateSession() {
      triggerAnalytics('logout');
      this.get('session').invalidate();
    },

    updateOrg() {
      this.set("isUpdatingOrg", true);
      const tSomethingWentWrong = this.get("tSomethingWentWrong");
      const tOrganizationNameUpdated = this.get("tOrganizationNameUpdated");
      const org = this.get('organization').selected;
      org.set('name', this.get("organizationName"));
      org.save().then(() => {
        this.get("notify").success(tOrganizationNameUpdated);
        this.set("showUpdateOrgModal", true);
        this.set("isUpdatingOrg", false);
      }, () => {
        this.get("notify").error(tSomethingWentWrong);
        this.set("isUpdatingOrg", false);
      })
    }
  }

});

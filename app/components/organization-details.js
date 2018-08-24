import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({

    i18n: Ember.inject.service(),
    routing: Ember.inject.service('-routing'),
    ajax: Ember.inject.service(),
    notify: Ember.inject.service('notification-messages-service'),

    isNamespaces: true,
    isMembers: false,
    isTeams: false,
    showHide: true,
    editSave: false,
    isSettings: false,

    tOrganizationNameUpdated: t("organizationNameUpdated"),

    org: (function() {
      return this.get("store").queryRecord('organization', {id: this.get("organization.id")});
    }).property(),

    didInsertElement() {
      const route = this.get('routing.currentRouteName');
      const routeName = route.split(".")[2];
      if(routeName === "teams" || routeName === "team") {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', true);
        this.set('isSettings', false);
      }
      else if(routeName === "members") {
        this.set('isNamespaces', false);
        this.set('isMembers', true);
        this.set('isTeams', false);
        this.set('isSettings', false);
      }
      else if(routeName === "settings") {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', false);
        this.set('isSettings', true);
      }
    },

    namespaceClass: Ember.computed('isNamespaces', function() {
      if (this.get('isNamespaces')){
        return 'is-active';
      }
    }),

    memberClass: Ember.computed('isMembers', function() {
      if (this.get('isMembers')){
        return 'is-active';
      }
    }),

    teamClass: Ember.computed('isTeams', function() {
      if (this.get('isTeams')){
        return 'is-active';
      }
    }),

    settingsClass: Ember.computed('isSettings', function() {
      if (this.get('isSettings')){
        return 'is-active';
      }
    }),

    actions: {
      displayNamespaces() {
        this.set('isNamespaces', true);
        this.set('isMembers', false);
        this.set('isTeams', false);
        this.set('isSettings', false);
      },

      displayMembers() {
        this.set('isNamespaces', false);
        this.set('isMembers', true);
        this.set('isTeams', false);
        this.set('isSettings', false);
      },

      displayTeams() {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', true);
        this.set('isSettings', false);
      },

      displaySettings() {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', false);
        this.set('isSettings', true);
      },

      updateOrganization() {
        const orgId = this.get("org.id");
        const orgName = this.get("org.name");
        const tOrganizationNameUpdated = this.get("tOrganizationNameUpdated");
        const data = {
          name: orgName
        };
        const url = [ENV.endpoints.organizations, orgId].join('/');
        const that = this;
        this.get("ajax").put(url, {data})
        .then(function() {
          that.get("notify").success(tOrganizationNameUpdated);
          that.send("cancelEditing");
        })
        .catch(function(error) {
          that.get("notify").error(error.payload.message);
        });
      },

      editOrganization() {
        this.set('showHide', false);
        this.set('editSave', true);
      },

      cancelEditing() {
        this.set('showHide', true);
        this.set('editSave', false);
      }
    }
});

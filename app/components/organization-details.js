import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({

    i18n: Ember.inject.service(),
    routing: Ember.inject.service('-routing'),
    ajax: Ember.inject.service(),
    notify: Ember.inject.service('notification-messages-service'),

    isUsers: true,
    isTeams: false,
    showHide: true,
    editSave: false,
    isInvitation: false,

    tOrganizationNameUpdated: t("organizationNameUpdated"),

    org: (function() {
      return this.get("store").queryRecord('organization', {id: this.get("organization.id")});
    }).property(),

    didInsertElement() {
      const route = this.get('routing.currentRouteName');
      const routeName = route.split(".")[2];
      if(routeName === "teams" || routeName === "team") {
        this.set('isUsers', false);
        this.set('isTeams', true);
        this.set('isInvitation', false);
      }
      else if(routeName === "invitations") {
        this.set('isUsers', false);
        this.set('isTeams', false);
        this.set('isInvitation', true);
      }
    },

    userClass: Ember.computed('isUsers', function() {
      if (this.get('isUsers')){
        return 'is-active';
      }
    }),

    teamClass: Ember.computed('isTeams', function() {
      if (this.get('isTeams')){
        return 'is-active';
      }
    }),

    invitationClass: Ember.computed('isInvitation', function() {
      if (this.get('isInvitation')){
        return 'is-active';
      }
    }),

    actions: {
      displayUser() {
        this.set('isUsers', true);
        this.set('isTeams', false);
        this.set('isInvitation', false);
      },

      displayTeam() {
        this.set('isUsers', false);
        this.set('isTeams', true);
        this.set('isInvitation', false);
      },

      displayInvitation() {
        this.set('isUsers', false);
        this.set('isTeams', false);
        this.set('isInvitation', true);
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
        })
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

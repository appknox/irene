import Ember from 'ember';

const OrganizationOverviewComponent = Ember.Component.extend({

  isUsers: true,
  isTeams: false,

  userClass: Ember.computed('isUsers', function() {
    if (this.get('isUsers')) {
      return 'is-active';
    }
  }),

  teamClass: Ember.computed('isTeams', function() {
    if (this.get('isTeams')) {
      return 'is-active';
    }
  }),

  didInsertElement() {
    if(window.location.pathname.startsWith("/organization/team/")) {
      this.set("isUsers", false);
      this.set("isTeams", true);
    }
  },

  actions: {
    displayUser() {
      this.set('isUsers', true);
      this.set('isTeams', false);
    },

    displayTeam() {
      this.set('isUsers', false);
      this.set('isTeams', true);
    }
  }
});

export default OrganizationOverviewComponent;

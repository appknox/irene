import Ember from 'ember';

const OrganizationOverviewComponent = Ember.Component.extend({

  isUsers: true,
  isTeams: false,
  isInvitation: false,

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

  invitationClass: Ember.computed('isInvitation', function() {
    if (this.get('isInvitation')) {
      return 'is-active';
    }
  }),

  didInsertElement() {
    if(window.location.pathname.startsWith("/organization/team")) {
      this.set("isUsers", false);
      this.set("isInvitation", false);
      this.set("isTeams", true);
    }
    else if(window.location.pathname === "/organization/invitations") {
      this.set("isUsers", false);
      this.set("isInvitation", true);
      this.set("isTeams", false);
    }
  },

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
    }
  }
});

export default OrganizationOverviewComponent;

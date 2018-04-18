import Ember from 'ember';

export default Ember.Component.extend({

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

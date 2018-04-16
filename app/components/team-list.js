import Ember from 'ember';

const TeamListComponent = Ember.Component.extend({
  orgTeams: (function() {
    return this.get("store").query('organization-team', {id: this.get("organization.id")});
  }).property(),
});

export default TeamListComponent;

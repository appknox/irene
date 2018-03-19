import Ember from 'ember';

const TeamListComponent = Ember.Component.extend({

  teams: (function() {
    return this.get("store").findAll("team");
  }).property()
});

export default TeamListComponent;

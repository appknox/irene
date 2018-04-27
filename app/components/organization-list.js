import Ember from 'ember';

export default Ember.Component.extend({
  organizations: (function() {
    return this.get("store").query('organization', {id: null});
  }).property(),
});

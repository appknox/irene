import Ember from 'ember';
import ENUMS from 'irene/enums';

export default Ember.Component.extend({
  tagName: ["tr"],

  teamProject: (function() {
    const id = this.get('project.id');
    return this.get("store").queryRecord('project', {id: id});
  }).property(),

  platformIconClass:( function() {
    switch (this.get("platform")) {
      case ENUMS.PLATFORM.ANDROID: return "android";
      case ENUMS.PLATFORM.IOS: return "apple";
      case ENUMS.PLATFORM.WINDOWS: return "windows";
      default: return "mobile";
    }
  }).property("platform"),
});

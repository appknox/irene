import Component from '@ember/component';
import { computed, observer} from '@ember/object';

export default Component.extend({

  targetObject: "dynamicscan-timeline",
  isDynamicDetails: false,
  limit: 10,
  offset: 0,
  version: 0,

  extraQueryStrings: computed(function() {
    const query =
      {dynamicscanId: this.get("dynamicscan.id"), limit: this.get('limit'), offset: this.get('offset')};
    return JSON.parse(JSON.stringify(query, Object.keys(query).sort()));
  }),
  objects: computed('version', function(){
    return this.get('store').query(this.get('targetObject'), this.get('extraQueryStrings'));
  }),
  sortedObjects: computed.sort('objects', 'sortProperties'),
  objectCount: computed.alias('objects.length'),
  hasObjects: computed.gt('objectCount', 0),
  hasNoObject: computed.equal('objectCount', 0),
  newMembersObserver: observer("dynamicscan.count", function() {
    this.incrementProperty("version");
  }),
  dynamicDetailsClass: computed('isDynamicDetails', function() {
    if (this.get('isDynamicDetails')) {
      return 'is-active';
    }
  }),
  actions:{
    displayDynamicDetails(){
      this.set('isDynamicDetails', !this.get('isDynamicDetails'))
    }
  },
 }
);

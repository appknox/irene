import DS from 'ember-data';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

export default DS.Model.extend({
  value: DS.attr('string'),
  createdOn: DS.attr('date'),
  approvedOn: DS.attr('date'),
  isApproved: DS.attr('boolean'),
  organization: DS.belongsTo('organization'),
  requestedBy: DS.belongsTo('organization-user'),
  approvedBy: DS.belongsTo('organization-user'),
  platform: DS.attr('number'),

  platformIconClass: computed('platform', function() {
    switch (this.get("platform")) {
      case ENUMS.PLATFORM.ANDROID: return "android";
      case ENUMS.PLATFORM.IOS: return "apple";
      case ENUMS.PLATFORM.WINDOWS: return "windows";
      default: return "mobile";
    }
  }),
});

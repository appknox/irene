/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr, belongsTo }  from '@ember-data/model';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

export default Model.extend({
  value: attr('string'),
  createdOn: attr('date'),
  approvedOn: attr('date'),
  isApproved: attr('boolean'),
  organization: belongsTo('organization'),
  requestedBy: belongsTo('organization-user'),
  approvedBy: belongsTo('organization-user'),
  platform: attr('number'),

  platformIconClass: computed('platform', function() {
    switch (this.get("platform")) {
      case ENUMS.PLATFORM.ANDROID: return "android";
      case ENUMS.PLATFORM.IOS: return "apple";
      case ENUMS.PLATFORM.WINDOWS: return "windows";
      default: return "mobile";
    }
  }),
});

import Ember from 'ember';
import DS from 'ember-data';
import dateTime from 'irene/utils/date-time';

const OrganizationInvitation = DS.Model.extend({
  email: DS.attr('string'),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  team: DS.belongsTo('organization-team'),
  organization: DS.belongsTo('organization'),

  createdOnHumanized: Ember.computed("createdOn", function() {
    return dateTime(this.get("createdOn"));
  }),

  updatedOnHumanized: Ember.computed("updatedOn", function() {
    return dateTime(this.get("updatedOn"));
  }),
});

export default OrganizationInvitation;

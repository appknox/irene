import DS from 'ember-data';

const OrganizationInvitation = DS.Model.extend({
  email: DS.attr('string'),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  team: DS.belongsTo('organization-team'),
  organization: DS.belongsTo('organization'),
});

export default OrganizationInvitation;

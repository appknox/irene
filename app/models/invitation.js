import DS from 'ember-data';

const Invitation = DS.Model.extend({

  role : DS.attr('number'),
  email: DS.attr('string'),
  'organization-user' : DS.belongsTo('organization-user'),
  'organization-team' : DS.belongsTo('organization-team')
});


export default Invitation;

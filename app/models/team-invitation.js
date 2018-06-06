import DS from 'ember-data';

const TeamInvitation = DS.Model.extend({

  role : DS.attr('number'),
  email: DS.attr('string'),
});


export default TeamInvitation;

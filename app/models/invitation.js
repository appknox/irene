import DS from 'ember-data';

const Invitation = DS.Model.extend({

  role : DS.attr('number'),
  email: DS.attr('string'),
  user : DS.belongsTo('user'),
  team : DS.belongsTo('team')
});


export default Invitation;

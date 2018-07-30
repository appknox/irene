import DS from 'ember-data';

export default DS.Model.extend({
   user: DS.attr('string'),
   name: DS.attr('string'),
   createdOn: DS.attr('date')
});

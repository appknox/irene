import DS from 'ember-data';

export default DS.Model.extend({
   uuid: DS.attr('string'),
   user: DS.attr('string'),
   name: DS.attr('string'),
   downloadUrl: DS.attr('string'),
   createdOn: DS.attr('date'),
   analysis: DS.belongsTo('analysis', {inverse: 'attachments'})
});

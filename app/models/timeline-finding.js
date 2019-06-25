import DS from 'ember-data';

export default DS.Model.extend({
    analysis: DS.belongsTo('analysis'),
    description: DS.attr('string'),
    title: DS.attr('string'),
});

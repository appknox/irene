import DS from 'ember-data';

export default DS.Model.extend({
    request: DS.attr(),
    shouldProcess: DS.attr('boolean'),
});

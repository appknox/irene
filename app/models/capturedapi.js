import DS from 'ember-data';

export default DS.Model.extend({
    isActive: DS.attr('boolean'),
    request: DS.attr()
});

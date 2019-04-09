import DS from 'ember-data';

export default DS.Model.extend({
    is_active: DS.attr('boolean'),
    request: DS.attr()
});

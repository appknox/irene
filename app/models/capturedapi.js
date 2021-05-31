import Model, { attr }  from '@ember-data/model';

export default Model.extend({
    isActive: attr('boolean'),
    request: attr()
});

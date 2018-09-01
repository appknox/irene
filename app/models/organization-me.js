import DS from 'ember-data';

export default DS.Model.extend({
  is_admin: DS.attr('boolean'),
  is_owner: DS.attr('boolean')
});

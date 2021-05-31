import Model, { attr, hasMany, belongsTo }  from '@ember-data/model';

export default Model.extend({
  member: belongsTo('organization-user'),
  role: attr('number'),
  roleDisplay: attr('string'),
  isAdmin: attr('boolean'),
  createdOn: attr('date'),
  teams: hasMany('organization-team')
});

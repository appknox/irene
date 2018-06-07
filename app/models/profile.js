import DS from 'ember-data';

export default DS.Model.extend({
  files: DS.hasMany('file', {inverse:'profile'}),
  showUnknownAnalysis: DS.attr('boolean')
});

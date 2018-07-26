import DS from 'ember-data';
import ENUMS from 'irene/enums';

export default DS.Model.extend({
  name: DS.attr('string'),
  user: DS.belongsTo('user'),
  project: DS.belongsTo('security/project'),
  analysis: DS.hasMany('security/analysis')
});

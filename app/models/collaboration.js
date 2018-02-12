/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';

const Collaboration = DS.Model.extend(BaseModelMixin, {

  project: DS.belongsTo('project', {inverse: 'collaborations'}),
  user: DS.belongsTo('user', {inverse: 'collaborations'}),
  team: DS.belongsTo('team', {inverse: 'collaborations'}),
  role: DS.attr('number'),
  username: DS.attr('string'),

  hasRole:(function() {
    const role = this.get("role");
    if (role === ENUMS.COLLABORATION_ROLE.UNKNOWN) {
      return false;
    }
    return true;
  }).property("role"),

  roleHumanized:(function() {
    switch (this.get("role")) {
      case ENUMS.COLLABORATION_ROLE.ADMIN: return "admin";
      case ENUMS.COLLABORATION_ROLE.MANAGER: return "manager";
      case ENUMS.COLLABORATION_ROLE.READ_ONLY: return "developer";
      default:
        return "noPreference";
    }
  }).property("role")
}
);

export default Collaboration;

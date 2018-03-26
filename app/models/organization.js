import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';

const Organization = DS.Model.extend(BaseModelMixin, {
  name: DS.attr('string'),
  userCount: DS.attr('number'),
  teamCount: DS.attr('number'),
  invitationCount: DS.attr('number'),
  users: DS.hasMany('user', {inverse: 'organization'}),
  teams: DS.hasMany('team', {inverse: 'organization'})
});

export default Organization;

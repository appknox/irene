import DS from 'ember-data';
import {
  computed
} from '@ember/object';

export default DS.Model.extend({
  is_admin: DS.attr('boolean'),
  is_owner: DS.attr('boolean'),
  is_member: computed('is_admin', 'is_owner', function () {
    return !this.get('is_admin') && !this.get('is_owner');
  }),
  can_access_partner_dashboard: true
});

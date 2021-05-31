import Model, { attr }  from '@ember-data/model';
import {
  computed
} from '@ember/object';

export default Model.extend({
  is_admin: attr('boolean'),
  is_owner: attr('boolean'),
  is_member: computed('is_admin', 'is_owner', function () {
    return !this.get('is_admin') && !this.get('is_owner');
  }),
  can_access_partner_dashboard: attr('boolean')
});

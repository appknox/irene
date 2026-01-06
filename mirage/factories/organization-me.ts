import { Factory } from 'miragejs';

export default Factory.extend({
  is_admin: true,
  is_owner: true,
  is_member: false,
  can_access_partner_dashboard: false,
  has_security_permission: false,
});

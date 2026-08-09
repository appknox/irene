/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error "trait" prop missing from miragejs
import { Factory, trait } from 'miragejs';

export default Factory.extend({
  is_admin: true,
  is_owner: true,
  is_member: false,
  can_access_partner_dashboard: false,
  has_security_permission: false,

  // `is_admin` and `is_owner` are independent on the API, so the roles are
  // separate traits rather than one enum.
  admin: trait({
    is_admin: true,
    is_owner: false,
    is_member: false,
  }),

  owner: trait({
    is_admin: false,
    is_owner: true,
    is_member: false,
  }),

  member: trait({
    is_admin: false,
    is_owner: false,
    is_member: true,
  }),
});

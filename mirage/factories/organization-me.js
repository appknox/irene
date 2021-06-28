import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  is_admin: true,
  is_owner: true,
  is_member: false,
});

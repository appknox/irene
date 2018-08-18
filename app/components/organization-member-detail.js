import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  user: null,
  organization: null,
  tagName: ["tr"],

  tUserRoleUpdated: t("userRoleUpdated"),

  roles: ENUMS.ORGANIZATION_ROLES.CHOICES.slice(0, -1),

  filteredUserRoles: (function() {
    const roles = this.get("roles");
    const userRole = this.get("user.role");
    return roles.filter(role => userRole !== role.value);
  }).property("roles", "user.role"),

  actions: {
    selectUserRole() {
      const userRole = parseInt(this.$('#org-user-role').val());
      const orgId= this.get("organization.id");
      const userId= this.get("user.id");
      const tUserRoleUpdated= this.get("tUserRoleUpdated");
      const data = {
        role: userRole
      };
      const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.users, userId].join('/');
      const that = this;
      this.get("ajax").put(url, {data})
      .then(function() {
        that.get("notify").success(tUserRoleUpdated);
      })
      .catch(function(error){
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

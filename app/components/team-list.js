import Component from '@ember/component';
import { computed } from '@ember/object';

const TeamListComponent = Component.extend({
  orgTeams: computed(function() {
    return this.get("store").query('organization-team', {id: this.get("organization.id")});
  }),
});

export default TeamListComponent;

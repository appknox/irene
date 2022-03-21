/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { computed } from '@ember/object';

const TeamListComponent = Component.extend({
  orgTeams: computed('organization.id', 'store', function() {
    return this.get("store").query('organization-team', {id: this.get("organization.id")});
  }),
});

export default TeamListComponent;

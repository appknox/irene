import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  i18n: service(),
  me: service(),

  classNames: [''],
  targetObject: 'organization-team-member',
  sortProperties: ['created:desc'],
  extraQueryStrings: computed('team.id', function() {
    const query = {
      teamId: this.get('team.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationTeamMembersObserver: observer("realtime.TeamMemberCounter", function() {
    return this.incrementProperty("version");
  }),
});

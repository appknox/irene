import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  i18n: service(),
  me: service(),

  classNames: [''],
  targetObject: 'project-team',
  sortProperties: ['created:desc'],
  extraQueryStrings: computed('project.id', function() {
    const query = {
      projectId: this.get('project.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newProjectTeamsObserver: observer('realtime.ProjectTeamCounter', function() {
    return this.incrementProperty('version');
  }),
});

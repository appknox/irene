import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  intl: service(),
  me: service(),

  classNames: [''],
  targetObject: 'project-collaborator',
  sortProperties: ['created:desc'],
  extraQueryStrings: computed('project.id', function() {
    const query = {
      projectId: this.get('project.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newProjectCollaboratorsObserver: observer('realtime.ProjectCollaboratorCounter', function() {
    return this.incrementProperty('version');
  }),
});

/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-get, ember/no-observers */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  intl: service(),
  me: service(),

  classNames: [''],
  targetModel: 'project-team',
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

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { PaginationMixin } from '../../mixins/paginate';

export default class ProjectCollaboratorList extends PaginationMixin(Component) {
  @service me;
  @service realtime;

  classNames = [''];
  targetModel = 'project-collaborator';
  sortProperties = ['created:desc'];

  constructor() {
    super(...arguments);
    this.realtime.addObserver(
      'ProjectCollaboratorCounter',
      this,
      'newProjectCollaboratorsObserver'
    );
  }

  get extraQueryStrings() {
    const query = {
      projectId: this.args.project.id,
    };

    return JSON.stringify(query, Object.keys(query).sort());
  }

  newProjectCollaboratorsObserver() {
    return this.reload();
  }
}

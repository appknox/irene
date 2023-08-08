import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { PaginationMixin } from '../../mixins/paginate';

export default class ProjectTeamList extends PaginationMixin(Component) {
  @service me;
  @service realtime;

  classNames = [''];
  targetModel = 'project-team';
  sortProperties = ['created:desc'];

  constructor() {
    super(...arguments);
    this.realtime.addObserver(
      'ProjectTeamCounter',
      this,
      'newProjectTeamsObserver'
    );
  }

  get extraQueryStrings() {
    const query = {
      projectId: this.args.project.id,
    };

    return JSON.stringify(query, Object.keys(query).sort());
  }

  newProjectTeamsObserver() {
    return this.reload();
  }
}

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OrganizationTeamProjectListProjectInfo extends Component {
  @service store;

  get teamProject() {
    return this.store.findRecord('project', this.args.project.id);
  }
}

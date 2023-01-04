import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class OrganizationTeamOverview extends Component {
  @action
  showTeamDetails() {
    this.args.showTeamDetails(this.args.team);
  }
}

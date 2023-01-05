import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OrganizationTeamDetails extends Component {
  @tracked activeActionDetails = null;

  @action
  handleActiveAction(details) {
    this.activeActionDetails = details;
  }

  @action
  cancelActiveAction() {
    this.activeActionDetails = null;
  }

  @action
  handleDrawerClose() {
    this.args.handleTeamDetailClose();
    this.cancelActiveAction();
  }
}

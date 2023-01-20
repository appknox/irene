import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class OrganizationMemberInviteUser extends Component {
  @tracked showInviteUserDrawer = false;

  @action
  openInviteUserDrawer() {
    this.showInviteUserDrawer = true;
  }

  @action
  closeDrawer() {
    this.showInviteUserDrawer = false;
  }

  @task()
  *inviteUser(action, drawerCloseHandler) {
    yield action(drawerCloseHandler);
  }
}

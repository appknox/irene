import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import OrganizationModel from 'irene/models/organization';
import OrganizationMemberModel from 'irene/models/organization-member';

interface OrganizationMemberInviteUserSignature {
  Args: {
    organization: OrganizationModel | null;
    onInviteUser?: (user: OrganizationMemberModel) => void;
  };
  Element: HTMLElement;
}

export default class OrganizationMemberInviteUser extends Component<OrganizationMemberInviteUserSignature> {
  @tracked showInviteUserDrawer = false;

  @action
  openInviteUserDrawer() {
    this.showInviteUserDrawer = true;
  }

  @action
  closeDrawer() {
    this.showInviteUserDrawer = false;
  }

  inviteUser = task(async (action, drawerCloseHandler) => {
    await action(drawerCloseHandler);
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationMember::InviteUser': typeof OrganizationMemberInviteUser;
  }
}

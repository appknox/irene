import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import OrganizationMemberModel from 'irene/models/organization-member';
import OrganizationModel from 'irene/models/organization';

interface MemberDrawerComponentSignature {
  Args: {
    organization: OrganizationModel | null;
    handleUserDetailClose: () => void;
    showUserDetailsView: boolean;
    member: OrganizationMemberModel | null;
  };
  Element: HTMLElement;
}

export default class MemberDrawerComponent extends Component<MemberDrawerComponentSignature> {
  @tracked showAddToTeamView = false;

  @action
  handleDrawerClose() {
    this.args.handleUserDetailClose();
    this.showAddToTeamView = false;
  }

  @action
  handleAddToTeam() {
    this.showAddToTeamView = true;
  }

  @action
  handleBackToTeamDetail() {
    this.showAddToTeamView = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationMember::List::MemberDrawer': typeof MemberDrawerComponent;
  }
}

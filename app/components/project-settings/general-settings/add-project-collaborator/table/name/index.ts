import Component from '@glimmer/component';
import OrganizationMemberModel from 'irene/models/organization-member';

interface ProjectSettingsGeneralSettingsAddProjectCollaboratorTableNameSignature {
  Args: {
    member: OrganizationMemberModel;
  };
}

export default class ProjectSettingsGeneralSettingsAddProjectCollaboratorTableNameComponent extends Component<ProjectSettingsGeneralSettingsAddProjectCollaboratorTableNameSignature> {
  get username() {
    return this.args.member.member.get('username');
  }
}

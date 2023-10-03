import Component from '@glimmer/component';
import OrganizationTeamModel from 'irene/models/organization-team';

interface AddProjectTeamTableNameSignature {
  Args: {
    team: OrganizationTeamModel;
  };
}

export default class AddProjectTeamTableNameComponent extends Component<AddProjectTeamTableNameSignature> {}

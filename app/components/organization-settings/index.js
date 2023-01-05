import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

class OrganizationSettings extends Component {
  @service me;

  get showOrgNameActionBtn() {
    return (
      this.args.model.organization.name !== '' && this.me.get('org.is_owner')
    );
  }
}

export default OrganizationSettings;

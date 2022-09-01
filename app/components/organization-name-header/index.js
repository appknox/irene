import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

class OrganizationNameHeader extends Component {
  @service me;

  get orgNameDoesNotExist() {
    return this.args.organization.name === '';
  }

  get isAddBtnDisabled() {
    return !this.me.get('org.is_owner');
  }
}

export default OrganizationNameHeader;

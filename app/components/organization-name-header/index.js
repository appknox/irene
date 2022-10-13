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

  voidFunction() {}

  get userType() {
    return this.me.get('org.is_owner')
      ? 'owner'
      : this.me.get('org.is_admin')
      ? 'admin'
      : 'member';
  }
}

export default OrganizationNameHeader;

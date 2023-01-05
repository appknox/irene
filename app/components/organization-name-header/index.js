import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

class OrganizationNameHeader extends Component {
  @service me;

  @tracked showAddEditModal = false;
  @tracked editModal = false;

  get orgNameDoesNotExist() {
    return this.args.organization.name === '';
  }

  get isAddBtnDisabled() {
    return !this.me.get('org.is_owner');
  }

  get userType() {
    return this.me.get('org.is_owner')
      ? 'owner'
      : this.me.get('org.is_admin')
      ? 'admin'
      : 'member';
  }

  @action
  handleAddOrgNameClick() {
    this.editModal = false;
    this.showAddEditModal = true;
  }

  @action
  handleEditOrgName() {
    this.editModal = true;
    this.showAddEditModal = true;
  }

  @action
  handleCancel() {
    this.showAddEditModal = false;
  }
}

export default OrganizationNameHeader;

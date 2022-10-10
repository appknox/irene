import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

class OrganizationSettings extends Component {
  @service me;

  @tracked showAddEditPopup = false;

  get orgNameDoesNotExist() {
    return this.args.model.organization.name === '';
  }

  get showOrgNameActionBtn() {
    return (
      this.args.model.organization.name !== '' && this.me.get('org.is_owner')
    );
  }

  @action
  addEditOrganization() {
    this.showAddEditPopup = true;
  }

  @action
  cancelEditing() {
    this.showAddEditPopup = false;
  }
}

export default OrganizationSettings;

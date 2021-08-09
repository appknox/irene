import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OrganizationSettingsHeaderComponent extends Component {
  // Dependencies
  @service organization;

  // Properties
  /**
   * @property {String} orgName
   */
  @tracked orgName = this.organization.selected.name;

  /**
   * @property {Boolean} isShowEditOrgName
   */
  @tracked isShowEditOrgName = false;

  // Actions
  @action
  toggleEditEnabled() {
    this.isShowEditOrgName = !this.isShowEditOrgName;
  }

  @action
  updateOrgName() {
    console.log('updated ', this.orgName);
  }
}

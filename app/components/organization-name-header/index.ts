import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type MeService from 'irene/services/me';
import type OrganizationModel from 'irene/models/organization';

interface OrganizationNameHeaderSignature {
  Args: {
    organization: OrganizationModel;
  };
  Blocks: {
    actionBtn: [{ openEditOrgNameModal: () => void }];
  };
}

export default class OrganizationNameHeaderComponent extends Component<OrganizationNameHeaderSignature> {
  @service declare me: MeService;

  @tracked showAddEditModal = false;
  @tracked editModal = false;

  get orgNameDoesNotExist() {
    return this.args.organization.name === '';
  }

  get isAddBtnDisabled() {
    return !this.me.get('org')?.get('is_owner');
  }

  get userType() {
    return this.me.get('org')?.get('is_owner')
      ? 'owner'
      : this.me.get('org')?.get('is_admin')
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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationNameHeader: typeof OrganizationNameHeaderComponent;
  }
}

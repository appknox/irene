import Component from '@glimmer/component';
import { service } from '@ember/service';

import type MeService from 'irene/services/me';

export default class OrganizationSettingsSkeletonLoaderComponent extends Component {
  @service declare me: MeService;

  get isOwnerOrAdmin() {
    return this.me.org?.get('is_owner') || this.me.org?.get('is_admin');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Settings::SkeletonLoader': typeof OrganizationSettingsSkeletonLoaderComponent;
  }
}

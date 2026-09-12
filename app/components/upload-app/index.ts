import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type OrganizationService from 'irene/services/organization';

export default class UploadAppComponent extends Component {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  get urlUploadAllowed() {
    return this.organization?.selected?.features?.upload_via_url;
  }

  get isOffsec() {
    return this.router.currentRouteName?.includes('offensive-security');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UploadApp: typeof UploadAppComponent;
  }
}

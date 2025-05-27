import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import OrganizationService from 'irene/services/organization';

export default class UploadAppComponent extends Component {
  @service declare organization: OrganizationService;

  get urlUploadAllowed() {
    return this.organization?.selected?.features?.upload_via_url;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UploadApp: typeof UploadAppComponent;
  }
}

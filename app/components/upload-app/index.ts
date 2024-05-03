import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ConfigurationService from 'irene/services/configuration';
import OrganizationService from 'irene/services/organization';

export default class UploadAppComponent extends Component {
  @service declare configuration: ConfigurationService;
  @service declare organization: OrganizationService;

  get urlUploadAllowed() {
    return this.configuration.serverData.urlUploadAllowed;
  }

  // TODO: Remove dependency on cypress org when feature is ready for release
  get isCypressOrg() {
    return this.organization.selected?.name.toLowerCase().includes('cypress');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UploadApp: typeof UploadAppComponent;
  }
}

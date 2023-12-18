import Component from '@glimmer/component';
import ConfigurationService from 'irene/services/configuration';
import { inject as service } from '@ember/service';

export default class UploadAppComponent extends Component {
  @service declare configuration: ConfigurationService;

  get urlUploadAllowed() {
    return this.configuration.serverData.urlUploadAllowed;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UploadApp: typeof UploadAppComponent;
  }
}

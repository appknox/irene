import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UploadAppViaLinkPreviewComponent extends Component {
  @tracked abc = true;
  @tracked xyz = false;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UploadApp::ViaLink::Preview': typeof UploadAppViaLinkPreviewComponent;
  }
}

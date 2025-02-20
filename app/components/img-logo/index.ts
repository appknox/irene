import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import WhitelabelService from 'irene/services/whitelabel';

interface ImgLogoSignature {
  Element: HTMLImageElement;
}

export default class ImgLogoComponent extends Component<ImgLogoSignature> {
  @service declare whitelabel: WhitelabelService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ImgLogo: typeof ImgLogoComponent;
  }
}

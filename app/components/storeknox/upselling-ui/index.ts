import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

export default class StoreknoxUpsellingUiComponent extends Component {
  @service declare intl: IntlService;

  get storeknoxFeatureList() {
    return [
      this.intl.t('storeknox.upsellingMessages.message1'),
      this.intl.t('storeknox.upsellingMessages.message2'),
      this.intl.t('storeknox.upsellingMessages.message3'),
      this.intl.t('storeknox.upsellingMessages.message4'),
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::UpsellingUi': typeof StoreknoxUpsellingUiComponent;
  }
}

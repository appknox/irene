import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';

export default class PartnerComponent extends Component {

  @service intl;

  clientGroups = [{
    label: this.intl.t('clients'),
    key: 'registered',
    model: 'client',
    active: true,
    link: 'authenticated.partner.clients'
  }];

}

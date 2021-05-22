import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  action
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';

export default class PartnerComponent extends Component {

  @service intl;
  @service store;

  @tracked showInviteModal = false;

  clientGroups = [{
    label: this.intl.t('clients'),
    key: 'registered',
    model: 'client',
    active: true,
    link: 'authenticated.partner.clients'
  }];

  @action
  toggleInviteModal() {
    this.showInviteModal = !this.showInviteModal;
  }

}

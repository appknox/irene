import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import AkNotificationsService from 'irene/services/ak-notifications';

export default class NotificationsPageBellIconComponent extends Component {
  @service declare AkNotifications: AkNotificationsService;
}

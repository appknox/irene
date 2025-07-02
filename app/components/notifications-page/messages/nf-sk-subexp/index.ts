import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { type NfSkSubexpContext } from './context';

export interface NotificationsPageMessagesNfSkSubexpComponentArgs {
  Args: {
    context: NfSkSubexpContext;
  };
}

export default class NotificationsPageMessagesNfSkSubexpComponent extends Component<NotificationsPageMessagesNfSkSubexpComponentArgs> {
  get subscriptionExpiryDate() {
    const expiryDate = this.args.context.subscription_end_date;

    if (expiryDate) {
      return dayjs(expiryDate).format('MMM D, YYYY');
    }

    return '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sk-subexp': typeof NotificationsPageMessagesNfSkSubexpComponent;
  }
}

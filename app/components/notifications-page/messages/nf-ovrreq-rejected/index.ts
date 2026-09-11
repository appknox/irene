import Component from '@glimmer/component';
import { type NfOvrreqRejectedContext } from './context';

export interface NotificationsPageMessagesNfOvrreqRejectedComponentArgs {
  Args: {
    context: NfOvrreqRejectedContext;
  };
}

export default class NotificationsPageMessagesNfOvrreqRejectedComponent extends Component<NotificationsPageMessagesNfOvrreqRejectedComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-ovrreq-rejected': typeof NotificationsPageMessagesNfOvrreqRejectedComponent;
  }
}

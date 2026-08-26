import Component from '@glimmer/component';
import { type NfOvrreqRaisedContext } from './context';

export interface NotificationsPageMessagesNfOvrreqRaisedComponentArgs {
  Args: {
    context: NfOvrreqRaisedContext;
  };
}

export default class NotificationsPageMessagesNfOvrreqRaisedComponent extends Component<NotificationsPageMessagesNfOvrreqRaisedComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-ovrreq-raised': typeof NotificationsPageMessagesNfOvrreqRaisedComponent;
  }
}

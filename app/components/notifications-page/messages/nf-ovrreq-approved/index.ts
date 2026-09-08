import Component from '@glimmer/component';
import { type NfOvrreqApprovedContext } from './context';

export interface NotificationsPageMessagesNfOvrreqApprovedComponentArgs {
  Args: {
    context: NfOvrreqApprovedContext;
  };
}

export default class NotificationsPageMessagesNfOvrreqApprovedComponent extends Component<NotificationsPageMessagesNfOvrreqApprovedComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-ovrreq-approved': typeof NotificationsPageMessagesNfOvrreqApprovedComponent;
  }
}

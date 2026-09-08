import Component from '@glimmer/component';
import { type NfOvrreqApprovedReqstrContext } from './context';

export interface NotificationsPageMessagesNfOvrreqApprovedReqstrComponentArgs {
  Args: {
    context: NfOvrreqApprovedReqstrContext;
  };
}

export default class NotificationsPageMessagesNfOvrreqApprovedReqstrComponent extends Component<NotificationsPageMessagesNfOvrreqApprovedReqstrComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-ovrreq-approved-reqstr': typeof NotificationsPageMessagesNfOvrreqApprovedReqstrComponent;
  }
}

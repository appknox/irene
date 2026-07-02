import Component from '@glimmer/component';
import { type NfJiraPushErrContext } from './context';

export interface NotificationsPageMessagesNfJiraPushErrComponentArgs {
  Args: {
    context: NfJiraPushErrContext;
  };
}

export default class NotificationsPageMessagesNfJiraPushErrComponent extends Component<NotificationsPageMessagesNfJiraPushErrComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-jira-push-err': typeof NotificationsPageMessagesNfJiraPushErrComponent;
  }
}

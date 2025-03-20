import Component from '@glimmer/component';
import { type NfNsapprvd1Context } from './context';

export interface NotificationsPageMessagesNfNsapprvd1ComponentArgs {
  Args: {
    context: NfNsapprvd1Context;
  };
}

export default class NotificationsPageMessagesNfNsapprvd1Component extends Component<NotificationsPageMessagesNfNsapprvd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsapprvd1': typeof NotificationsPageMessagesNfNsapprvd1Component;
  }
}

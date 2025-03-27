import Component from '@glimmer/component';
import { type NfNsautoapprvd1Context } from './context';

export interface NotificationsPageMessagesNfNsautoapprvd1ComponentArgs {
  Args: {
    context: NfNsautoapprvd1Context;
  };
}

export default class NotificationsPageMessagesNfNsautoapprvd1Component extends Component<NotificationsPageMessagesNfNsautoapprvd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsautoapprvd1': typeof NotificationsPageMessagesNfNsautoapprvd1Component;
  }
}

import Component from '@glimmer/component';
import { type NfStrUrlUpldfailpayrq1Context } from './context';

export interface NotificationsPageMessagesNfStrUrlUpldfailpayrq1ComponentArgs {
  Args: {
    context: NfStrUrlUpldfailpayrq1Context;
  };
}

export default class NotificationsPageMessagesNfStrUrlUpldfailpayrq1Component extends Component<NotificationsPageMessagesNfStrUrlUpldfailpayrq1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-upldfailpayrq1': typeof NotificationsPageMessagesNfStrUrlUpldfailpayrq1Component;
  }
}

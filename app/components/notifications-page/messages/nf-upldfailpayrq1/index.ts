import Component from '@glimmer/component';
import { type NfUpldfailpayrq1Context } from './context';

export interface NotificationsPageMessagesNfUpldfailpayrq1ComponentArgs {
  Args: {
    context: NfUpldfailpayrq1Context;
  };
}

export default class NotificationsPageMessagesNfUpldfailpayrq1Component extends Component<NotificationsPageMessagesNfUpldfailpayrq1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-upldfailpayrq1': typeof NotificationsPageMessagesNfUpldfailpayrq1Component;
  }
}

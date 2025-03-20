import Component from '@glimmer/component';
import { type NfUpldfailnsunaprv1Context } from './context';

export interface NotificationsPageMessagesNfUpldfailnsunaprv1ComponentArgs {
  Args: {
    context: NfUpldfailnsunaprv1Context;
  };
}

export default class NotificationsPageMessagesNfUpldfailnsunaprv1Component extends Component<NotificationsPageMessagesNfUpldfailnsunaprv1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-upldfailnsunaprv1': typeof NotificationsPageMessagesNfUpldfailnsunaprv1Component;
  }
}

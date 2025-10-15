import Component from '@glimmer/component';
import { type NfPublicApiUserUpdatedContext } from './context';

export interface NotificationsPageMessagesNfPublicApiUserUpdatedContextArgs {
  Args: {
    context: NfPublicApiUserUpdatedContext;
  };
}

export default class NotificationsPageMessagesNfPublicApiUserUpdatedContext extends Component<NotificationsPageMessagesNfPublicApiUserUpdatedContextArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-public-api-user-updated': typeof NotificationsPageMessagesNfPublicApiUserUpdatedContext;
  }
}

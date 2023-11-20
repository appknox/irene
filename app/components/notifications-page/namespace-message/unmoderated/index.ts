import Component from '@glimmer/component';

export interface NotificationsPageNamespaceMessageUnmoderatedSignature {
  Args: {
    onApprove: () => Promise<void>;
    onReject: () => Promise<void>;
  };
}

export default class NotificationsPageNamespaceMessageUnmoderatedComponent extends Component<NotificationsPageNamespaceMessageUnmoderatedSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::NamespaceMessage::Unmoderated': typeof NotificationsPageNamespaceMessageUnmoderatedComponent;
  }
}

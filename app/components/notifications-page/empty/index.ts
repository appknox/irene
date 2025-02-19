import Component from '@glimmer/component';

interface NotificationsPageEmptyComponentComponentSignature {
  Args: {
    message: string;
  };
}

export default class NotificationsPageEmptyComponent extends Component<NotificationsPageEmptyComponentComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::Empty': typeof NotificationsPageEmptyComponent;
  }
}

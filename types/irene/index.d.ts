import Ember from 'ember';

declare global {
  // Prevents ESLint from "fixing" this via its auto-fix to turn it into a type
  // alias (e.g. after running any Ember CLI generator)
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}

  interface NotificationOption {
    message: string;
    type?: 'info' | 'error' | 'success' | 'warning';
    autoClear?: boolean;
    clearDuration?: number;
    onClick?: (event: MouseEvent) => void;
    htmlContent?: boolean;
    cssClasses?: string;
  }

  interface NotificationService {
    add: (notification: NotificationOption) => Ember.Object;

    error: (
      message: string,
      options?: Omit<NotificationOption, 'message' | 'type'>
    ) => void;

    success: (
      message: string,
      options?: Omit<NotificationOption, 'message' | 'type'>
    ) => void;

    info: (
      message: string,
      options?: Omit<NotificationOption, 'message' | 'type'>
    ) => void;

    warning: (
      message: string,
      options?: Omit<NotificationOption, 'message' | 'type'>
    ) => void;
  }
}

export {};

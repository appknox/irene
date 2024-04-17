import Ember from 'ember';
import { Csb, Module, Product } from 'irene/config/environment';

declare global {
  // Prevents ESLint from "fixing" this via its auto-fix to turn it into a type
  // alias (e.g. after running any Ember CLI generator)
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}

  // Restrict an integer value to a certain range
  // src - https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
  type Enumerate<
    N extends number,
    Acc extends number[] = [],
  > = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>;

  type IntRange<F extends number, T extends number> = Exclude<
    Enumerate<T>,
    Enumerate<F>
  >;

  // Types for the CSB Analytics
  interface CsbAnalytics {
    logout: () => void;
    login: (userId: string, accountId: string) => void;
    identify: (
      userId: string,
      identification: CsbAnalyticsUserIdentificationObject
    ) => void;
    feature: (feature: string, module: Module, product: Product) => void;
  }

  type CsbAnalyticsType = 'feature' | 'login' | 'logout';

  type CsbAnalyticsUserIdentificationObject = {
    custom_username: string;
    email: string;
    account_id: string;
    custom_Organization: string;
    custom_role: string;
    first_name: string;
  };

  type CsbAnalyticsFeatureData = Csb;

  type CsbAnalyticsLoginData = {
    userName: string;
    userEmail: string;
    accountId: string;
    accountName: string;
    userRole: string;
    userId: string;
  };

  type CsbAnalyticsData = CsbAnalyticsFeatureData | CsbAnalyticsLoginData;

  interface CrispInstance {
    push: (...args: unknown[]) => void;
    show: (...args: unknown[]) => void;
    on: (...args: unknown[]) => void;
    off: (...args: unknown[]) => void;
  }

  interface PendoInstance {
    getActiveGuides: () => PendoGuide[];
  }

  interface PendoGuide {
    show: () => Promise<boolean>;
    launchMethod: 'auto-badge';
  }

  interface Window {
    FreshworksWidget: (...args: unknown[]) => void;
    $crisp: CrispInstance;
    pendo: PendoInstance;
    CRISP_WEBSITE_ID: string;
    fwSettings: { widget_id: string };
    analytics?: CsbAnalytics;
    grecaptcha?: { execute: (options: { action: string }) => Promise<string> };
  }

  // Notification Types
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

    setDefaultAutoClear: (value: boolean) => void;
  }

  export interface AdapterError {
    isAdapterError?: boolean;
    stack?: string;
    message?: string;
    name?: string;
    errors?: Error[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }

  interface Error {
    status?: string | number;
    title?: string;
    detail?: string;
  }

  export interface AjaxError {
    status: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
  }
}

export {};

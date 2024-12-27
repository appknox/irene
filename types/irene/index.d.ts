/* eslint-disable @typescript-eslint/no-explicit-any */
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

  type UnknownFnType = (...args: unknown[]) => void;

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

  interface PendoInstance {
    getActiveGuides: () => PendoGuide[];
  }

  interface PendoGuide {
    show: () => Promise<boolean>;
    launchMethod: 'auto-badge';
  }

  interface Window {
    FreshworksWidget: UnknownFnType;
    fcWidget: {
      open: UnknownFnType;
      isOpen(): boolean;
      destroy(): void;

      on(
        event: string,
        cb: (val: { status: number; data: { restoreId: string } }) => void
      ): void;

      user: {
        get(
          cb: (val: { status: number; data: { restoreId: string } }) => void
        ): void;

        create(val: Record<string, string | undefined>): void;
        setProperties(val: Record<string, string | undefined>): void;
      };
    };
    pendo: PendoInstance;
    CRISP_WEBSITE_ID: string;
    fwSettings: { widget_id: string };
    fcSettings: object;
    fcWidgetMessengerConfig: object;
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

    alert: (
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

  // Type Merging for Distinct Objects
  // SRC: https://stackoverflow.com/questions/60795256/typescript-type-merging
  type Primitive =
    | string
    | number
    | boolean
    | bigint
    | symbol
    | null
    | undefined;

  type Expand<T> = T extends Primitive
    ? T
    : {
        [K in keyof T]: T[K];
      };

  type OptionalKeys<T> = {
    [K in keyof T]-?: T extends Record<K, T[K]> ? never : K;
  }[keyof T];

  type RequiredKeys<T> = {
    [K in keyof T]-?: T extends Record<K, T[K]> ? K : never;
  }[keyof T] &
    keyof T;

  type RequiredMergeKeys<T, U> = RequiredKeys<T> & RequiredKeys<U>;

  type OptionalMergeKeys<T, U> =
    | OptionalKeys<T>
    | OptionalKeys<U>
    | Exclude<RequiredKeys<T>, RequiredKeys<U>>
    | Exclude<RequiredKeys<U>, RequiredKeys<T>>;

  type MergeNonUnionObjects<T, U> = Expand<
    {
      [K in RequiredMergeKeys<T, U>]: Expand<Merge<T[K], U[K]>>;
    } & {
      [K in OptionalMergeKeys<T, U>]?: K extends keyof T
        ? K extends keyof U
          ? Expand<Merge<Exclude<T[K], undefined>, Exclude<U[K], undefined>>>
          : T[K]
        : K extends keyof U
          ? U[K]
          : never;
    }
  >;

  type MergeNonUnionArrays<
    T extends readonly any[],
    U extends readonly any[],
  > = Array<Expand<Merge<T[number], U[number]>>>;

  type MergeObjects<T, U> = [T] extends [never]
    ? U extends any
      ? MergeNonUnionObjects<T, U>
      : never
    : [U] extends [never]
      ? T extends any
        ? MergeNonUnionObjects<T, U>
        : never
      : T extends any
        ? U extends any
          ? MergeNonUnionObjects<T, U>
          : never
        : never;

  type Merge<T, U> =
    | Extract<T | U, Primitive>
    | MergeObjects<
        Exclude<T, Primitive | readonly any[]>,
        Exclude<U, Primitive | readonly any[]>
      >;
}

export {};

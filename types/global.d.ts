import '@glint/environment-ember-loose';
import type { TemplateFactory } from 'ember-cli-htmlbars';
import type { HelperLike, ComponentLike, ModifierLike } from '@glint/template';
import type { BreadcrumbsContainerModifierArgs } from 'irene/modifiers/breadcrumbs-container';
import type { BreadcrumbsItemModifierArgs } from 'irene/modifiers/breadcrumbs-item';
import type EmberConcurrencyRegistry from 'ember-concurrency/template-registry';
import type EmberPowerSelectRegistry from 'ember-power-select/template-registry';
import type EmberBasicDropdownRegistry from 'ember-basic-dropdown/template-registry';
import type EmberTableRegistry from 'ember-table/template-registry';
import type AkSvgRegistry from 'ak-svg';

// Types for compiled templates
declare module 'irene/templates/*' {
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@glint/environment-ember-loose/registry' {
  type UnknownFnWithAnyArgType = (...args: any[]) => void;

  export default interface Registry
    extends AkSvgRegistry,
      EmberTableRegistry,
      EmberConcurrencyRegistry,
      EmberPowerSelectRegistry,
      EmberBasicDropdownRegistry {
    element: HelperLike<{
      Args: { Positional: [tagName: string] };
      Return: ComponentLike<{
        Element: HTMLElement;
        Blocks: { default: [] };
      }>;
    }>;

    EmberWormhole: ComponentLike<{
      Args: {
        to: string;
        renderInPlace?: boolean;
      };
      Blocks: { default: [] };
    }>;

    'blank-template': ComponentLike<{
      Blocks: {
        default: [];
      };
    }>;

    'day-js': HelperLike<{
      Args: {
        Named: {
          date?: Date;
          format?: string;
        };
      };
      Return: string;
    }>;

    t: HelperLike<{
      Args: {
        Positional: [string];
        Named: {
          [key: string]: unknown;
          htmlSafe?: boolean;
        };
      };
      Return: string;
    }>;

    eq: HelperLike<{
      Args: {
        Positional: [string | number, string | number];
      };
      Return: boolean;
    }>;

    and: HelperLike<{
      Args: {
        Positional: unknown[];
      };
      Return: boolean;
    }>;

    not: HelperLike<{
      Args: {
        Positional: [unknown];
      };
      Return: boolean;
    }>;

    'page-title': HelperLike<{
      Args: {
        Positional: string[];
        Named: {
          [key: string]: unknown;
          separator?: string;
          prepend?: boolean;
          replace?: boolean;
        };
      };
      Return: void;
    }>;

    style: ModifierLike<{
      Args: {
        Positional: [];
        Named: {
          [key: string]: string | undefined;
        };
      };
      Return: Array<string[]>;
    }>;

    'did-insert': ModifierLike<{
      Args: {
        Positional: [UnknownFnWithAnyArgType];
      };
      Return: void;
    }>;

    'will-destroy': ModifierLike<{
      Args: {
        Positional: [UnknownFnWithAnyArgType];
      };
      Return: void;
    }>;

    'breadcrumbs-container': ModifierLike<{
      Args: BreadcrumbsContainerModifierArgs;
      Return: void;
    }>;

    'breadcrumbs-item': ModifierLike<{
      Args: BreadcrumbsItemModifierArgs;
      Return: void;
    }>;

    ConfirmBox: ComponentLike<{
      Args: {
        title?: string | null;
        confirmText?: string;
        cancelText?: string;
        key?: string;
        delegate?: { confirmCallback?: ((key?: string) => void) | undefined };
        isActive?: boolean;
        disabled?: boolean;
        confirmAction?: () => void;
        cancelAction?: () => void;
        blurOverlay?: boolean;
        description?: string;
      };
      Blocks: {
        default: [];
        content: [];
      };
    }>;
  }
}

import '@glint/environment-ember-loose';
import { TemplateFactory } from 'ember-cli-htmlbars';
import { HelperLike, ComponentLike, ModifierLike } from '@glint/template';
import { BreadcrumbsContainerModifierArgs } from 'irene/modifiers/breadcrumbs-container';
import { BreadcrumbsItemModifierArgs } from 'irene/modifiers/breadcrumbs-item';
import {
  PowerSelectArgs,
  Select,
} from 'ember-power-select/components/power-select';
import EmberTableRegistry from 'ember-table/template-registry';

// Types for compiled templates
declare module 'irene/templates/*' {
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@glint/environment-ember-loose/registry' {
  interface PowerSelectExtendedArgs extends PowerSelectArgs {
    triggerId?: string;
    dropdownClass?: string;
    triggerClass?: string;
    placeholder?: string;
    disabled?: boolean;
    renderInPlace?: boolean;
    ariaInvalid: string;
    loadingMessage?: string;
    selectedItemComponent?: string;
    verticalPosition?: 'above' | 'below' | 'auto';
  }

  export default interface Registry extends EmberTableRegistry {
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

    PowerSelect: ComponentLike<{
      Element: HTMLElement;
      Args: PowerSelectExtendedArgs;
      Blocks: {
        default: [option: unknown, select?: Select];
      };
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

    style: ModifierLike<{
      Args: {
        Positional: [];
        Named: {
          [key: string]: string | undefined;
        };
      };
      Return: Array<string[]>;
    }>;

    'breadcrumbs-container': ModifierLike<{
      Args: BreadcrumbsContainerModifierArgs;
      Return: void;
    }>;

    'breadcrumbs-item': ModifierLike<{
      Args: BreadcrumbsItemModifierArgs;
      Return: void;
    }>;
  }
}

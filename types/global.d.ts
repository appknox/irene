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
import AkSvgRegistry from 'ak-svg';

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

  export default interface Registry extends EmberTableRegistry, AkSvgRegistry {
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

    DatePicker: ComponentLike<{
      Element: HTMLInputElement;
      Args: {
        value?: string | null;
        onChange?: (event: Event, value: string) => void | null;
        renderInPlace?: boolean;
        minDate?: Date | null;
        maxDate?: Date | null;
        range?: boolean;
        options?: boolean;
        availableYearOffset?: number;
        disabledDates?: boolean;
        disableMonthPicker?: boolean;
        disableYearPicker?: boolean;
        horizontalPosition?: string;
        verticalPosition?: string;
        buttonClasses?: string;
      };
      Blocks: {
        default: [api: [null | Date, null | Date | undefined]];
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

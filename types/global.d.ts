import { TemplateFactory } from 'ember-cli-htmlbars';
import { HelperLike, ComponentLike, ModifierLike } from '@glint/template';

import '@glint/environment-ember-loose';
import {
  PowerSelectArgs,
  Select,
} from 'ember-power-select/components/power-select';

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

  export default interface Registry {
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
          [key: string]: string;
        };
      };
      Return: Array<string[]>;
    }>;

    PowerSelect: ComponentLike<{
      Element: HTMLElement;
      Args: PowerSelectExtendedArgs;
      Blocks: {
        default: [option: unknown, select?: Select];
      };
    }>;
  }
}

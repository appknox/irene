import '@glint/environment-ember-loose';
import type { TemplateFactory } from 'ember-cli-htmlbars';
import type { HelperLike, ComponentLike, ModifierLike } from '@glint/template';
import type EmberConcurrencyRegistry from 'ember-concurrency/template-registry';
import type EmberPowerSelectRegistry from 'ember-power-select/template-registry';
import type EmberBasicDropdownRegistry from 'ember-basic-dropdown/template-registry';
import type EmberTableRegistry from 'ember-table/template-registry';
import type EmberIntlRegistry from 'ember-intl/template-registry';
import type EmberFileUploadRegistry from 'ember-file-upload/template-registry';
import type AkSvgRegistry from 'ak-svg';
import type OrHelper from 'ember-truth-helpers/helpers/or';
import type gtHelper from 'ember-truth-helpers/helpers/gt';
import type notEqHelper from 'ember-truth-helpers/helpers/not-eq';
import type andHelper from 'ember-truth-helpers/helpers/and';
import type notHelper from 'ember-truth-helpers/helpers/not';
import type eqHelper from 'ember-truth-helpers/helpers/eq';

// Types for compiled templates
declare module 'irene/templates/*' {
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@glint/environment-ember-loose/registry' {
  type UnknownFnWithAnyArgType = (...args: any[]) => void;
  type PrimitiveTypes = string | number | boolean | undefined | null;

  export default interface Registry
    extends AkSvgRegistry,
      EmberTableRegistry,
      EmberConcurrencyRegistry,
      EmberPowerSelectRegistry,
      EmberBasicDropdownRegistry,
      EmberFileUploadRegistry,
      EmberIntlRegistry {
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

    'dayjs-from-now': HelperLike<{
      Args: { Positional: [string | Date | number] };
      Return: string;
    }>;

    eq: typeof eqHelper;
    'not-eq': typeof notEqHelper;
    gt: typeof gtHelper;
    or: typeof OrHelper;
    and: typeof andHelper;
    not: typeof notHelper;

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

    'did-update': ModifierLike<{
      Args: {
        Positional: [callback: UnknownFnWithAnyArgType, params?: unknown];
      };
      Return: void;
    }>;

    'will-destroy': ModifierLike<{
      Args: {
        Positional: [UnknownFnWithAnyArgType];
      };
      Return: void;
    }>;
  }
}

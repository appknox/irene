import { TemplateFactory } from 'ember-cli-htmlbars';
import { HelperLike, ComponentLike } from '@glint/template';

import '@glint/environment-ember-loose';

import type CssTransitionsRegistry from 'ember-css-transitions/template-registry';

// Types for compiled templates
declare module 'irene/templates/*' {
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends CssTransitionsRegistry {
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
  }
}

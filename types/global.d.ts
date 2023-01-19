import { TemplateFactory } from 'ember-cli-htmlbars';
import { HelperLike, ComponentLike } from '@glint/template';

import '@glint/environment-ember-loose';

// Types for compiled templates
declare module 'irene/templates/*' {
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    element: HelperLike<{
      Args: { Positional: [tagName: string] };
      Return: ComponentLike<{
        Element: HTMLElement;
        Blocks: { default: [] };
      }>;
    }>;
  }
}

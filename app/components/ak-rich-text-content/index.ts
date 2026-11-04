import Component from '@glimmer/component';

export interface AkRichTextContentSignature {
  Element: HTMLDivElement;
  Args: {
    value?: string | null;
  };
}

/**
 * Renders what AkRichTextEditor produced, read-only, with the same content
 * styles. Sanitizing is delegated to the sanitize-finding-html helper.
 */
export default class AkRichTextContentComponent extends Component<AkRichTextContentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkRichTextContent: typeof AkRichTextContentComponent;
  }
}

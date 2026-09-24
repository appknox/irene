import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type { Editor } from '@tiptap/core';

export const AK_RICH_TEXT_EDITOR_FORMATS = [
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'bulletList',
  'orderedList',
  'codeBlock',
] as const;

export type AkRichTextEditorFormat =
  (typeof AK_RICH_TEXT_EDITOR_FORMATS)[number];

export interface AkRichTextEditorSignature {
  Element: HTMLDivElement;
  Args: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (html: string) => void;
  };
}

export default class AkRichTextEditorComponent extends Component<AkRichTextEditorSignature> {
  editor: Editor | null = null;

  // Tiptap state sits outside Glimmer's tracking, so the toolbar reads these
  // instead of the editor. The modifier refreshes them on every transaction.
  @tracked activeFormats: AkRichTextEditorFormat[] = [];
  @tracked isEmpty = true;
  @tracked isLinkActive = false;

  @tracked isLinkFieldOpen = false;
  @tracked linkUrl = '';

  get isEditable() {
    return !this.args.disabled;
  }

  get showPlaceholder() {
    return Boolean(this.args.placeholder) && this.isEmpty;
  }

  get linkButtonLabelKey() {
    return this.isLinkActive
      ? 'akRichTextEditor.removeLink'
      : 'akRichTextEditor.addLink';
  }

  @action
  isActive(format: AkRichTextEditorFormat) {
    return this.activeFormats.includes(format);
  }

  @action
  registerEditor(editor: Editor) {
    this.editor = editor;
  }

  @action
  readEditorState(editor: Editor) {
    this.activeFormats = AK_RICH_TEXT_EDITOR_FORMATS.filter((format) =>
      editor.isActive(format)
    );

    this.isEmpty = editor.isEmpty;
    this.isLinkActive = editor.isActive('link');
  }

  @action
  handleChange(html: string) {
    this.args.onChange?.(html);
  }

  @action
  toggleFormat(format: AkRichTextEditorFormat) {
    const chain = this.editor?.chain().focus();

    if (!chain) {
      return;
    }

    switch (format) {
      case 'bold':
        return chain.toggleBold().run();
      case 'italic':
        return chain.toggleItalic().run();
      case 'underline':
        return chain.toggleUnderline().run();
      case 'strike':
        return chain.toggleStrike().run();
      case 'code':
        return chain.toggleCode().run();
      case 'bulletList':
        return chain.toggleBulletList().run();
      case 'orderedList':
        return chain.toggleOrderedList().run();
      case 'codeBlock':
        return chain.toggleCodeBlock().run();
    }
  }

  @action
  toggleLink() {
    if (this.isLinkActive) {
      this.editor?.chain().focus().unsetLink().run();

      return;
    }

    this.linkUrl = '';
    this.isLinkFieldOpen = true;
  }

  @action
  closeLinkField() {
    this.isLinkFieldOpen = false;
    this.linkUrl = '';
  }

  @action
  updateLinkUrl(event: Event) {
    this.linkUrl = (event.target as HTMLInputElement).value;
  }

  @action
  applyLink(event: Event) {
    event.preventDefault();

    const href = this.linkUrl.trim();

    if (href) {
      this.editor?.chain().focus().setLink({ href }).run();
    }

    this.closeLinkField();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkRichTextEditor: typeof AkRichTextEditorComponent;
  }
}

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export interface TiptapEditorModifierNamedArgs {
  value?: string;
  editable?: boolean;
  onCreate?: (editor: Editor) => void;
  onChange?: (html: string) => void;
  onStateChange?: (editor: Editor) => void;
}

export interface TiptapEditorModifierSignature {
  Element: HTMLElement;
  Args: {
    Positional: [];
    Named: TiptapEditorModifierNamedArgs;
  };
}

/**
 * Mounts a tiptap editor on the element and keeps it in step with its args.
 * `modify` runs again whenever an arg changes, so the editor is created once
 * and then synced in place rather than torn down and rebuilt.
 */
export default class TiptapEditorModifier extends Modifier<TiptapEditorModifierSignature> {
  editor: Editor | null = null;

  // True while the editor is being brought in line with its args, so nothing
  // that happens in here is reported back as a user edit. Both setContent and
  // setEditable emit an update by default, and `modify` runs during render —
  // so without this the caller is written to while it is still rendering.
  isSyncing = false;

  modify(
    element: HTMLElement,
    _positional: [],
    named: TiptapEditorModifierNamedArgs
  ) {
    if (!this.editor) {
      this.setupEditor(element, named);

      return;
    }

    this.isSyncing = true;

    try {
      this.syncValue(named.value ?? '');
      this.syncEditable(named.editable ?? true);
    } finally {
      this.isSyncing = false;
    }
  }

  syncEditable(editable: boolean) {
    if (!this.editor || this.editor.isEditable === editable) {
      return;
    }

    this.editor.setEditable(editable, false);
  }

  setupEditor(element: HTMLElement, named: TiptapEditorModifierNamedArgs) {
    const editor = new Editor({
      element,
      content: named.value ?? '',
      editable: named.editable ?? true,
      extensions: [StarterKit],
      onTransaction: () => named.onStateChange?.(editor),
      onUpdate: () => {
        if (!this.isSyncing) {
          named.onChange?.(editor.getHTML());
        }
      },
    });

    this.editor = editor;

    registerDestructor(this, () => {
      editor.destroy();
      this.editor = null;
    });

    named.onCreate?.(editor);
    named.onStateChange?.(editor);
  }

  syncValue(value: string) {
    // Guard the round trip: onUpdate hands html to the caller, the caller
    // writes it back as @value, and resetting content would drop the cursor.
    if (!this.editor || this.editor.getHTML() === value) {
      return;
    }

    this.editor.commands.setContent(value, { emitUpdate: false });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'tiptap-editor': typeof TiptapEditorModifier;
  }
}

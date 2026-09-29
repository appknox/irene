import Component from '@glimmer/component';
import { action } from '@ember/object';

export interface SecurityAnalysisDetailsValidatedFindingsRichTextFieldSignature {
  Args: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  Element: HTMLDivElement;
}

interface ToolbarCommand {
  label: string;
  command: string;
  title: string;
}

// execCommand is deprecated but remains the only dependency-free way to
// drive a contenteditable toolbar; no rich-text library exists in this
// codebase, so this ports the mock's vanilla approach rather than adding one.
const TOOLBAR_COMMANDS: ToolbarCommand[] = [
  { label: 'B', command: 'bold', title: 'Bold' },
  { label: 'I', command: 'italic', title: 'Italic' },
  { label: 'U', command: 'underline', title: 'Underline' },
  { label: 'S', command: 'strikeThrough', title: 'Strikethrough' },
];

export default class SecurityAnalysisDetailsValidatedFindingsRichTextFieldComponent extends Component<SecurityAnalysisDetailsValidatedFindingsRichTextFieldSignature> {
  toolbarCommands = TOOLBAR_COMMANDS;

  private editorElement: HTMLDivElement | null = null;
  private lastValue = '';

  @action setup(element: HTMLDivElement) {
    this.editorElement = element;
    this.lastValue = this.args.value ?? '';
    element.innerHTML = this.lastValue;
  }

  @action syncValue(element: HTMLDivElement) {
    const value = this.args.value ?? '';
    if (value !== this.lastValue) {
      this.lastValue = value;
      element.innerHTML = value;
    }
  }

  @action onInput(event: Event) {
    this.notifyChange((event.target as HTMLDivElement).innerHTML);
  }

  @action runCommand(command: string, event: MouseEvent) {
    event.preventDefault();
    this.editorElement?.focus();
    document.execCommand(command);
    this.notifyCurrentValue();
  }

  @action insertInlineCode(event: MouseEvent) {
    event.preventDefault();
    this.editorElement?.focus();
    const text = window.getSelection()?.toString();
    if (!text) {
      return;
    }
    document.execCommand(
      'insertHTML',
      false,
      `<code>${escapeHtml(text)}</code>`
    );
    this.notifyCurrentValue();
  }

  @action insertCodeBlock(event: MouseEvent) {
    event.preventDefault();
    this.editorElement?.focus();
    document.execCommand(
      'insertHTML',
      false,
      '<pre><code>Code</code></pre><p><br></p>'
    );
    this.notifyCurrentValue();
  }

  @action insertLink(event: MouseEvent) {
    event.preventDefault();
    // eslint-disable-next-line no-alert
    const url = window.prompt('Link URL');
    if (!url) {
      return;
    }
    this.editorElement?.focus();
    document.execCommand('createLink', false, url);
    this.notifyCurrentValue();
  }

  private notifyCurrentValue() {
    if (this.editorElement) {
      this.notifyChange(this.editorElement.innerHTML);
    }
  }

  private notifyChange(value: string) {
    this.lastValue = value;
    this.args.onChange(value);
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::RichTextField': typeof SecurityAnalysisDetailsValidatedFindingsRichTextFieldComponent;
  }
}

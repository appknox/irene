import Component from '@glimmer/component';
import ClipboardJS from 'clipboard/src/clipboard';
import { guidFor } from '@ember/object/internals';

export interface AkClipboardSignature {
  Args: {
    id?: string;
    options?: ClipboardJS.Options;
    onSuccess?: (event: ClipboardJS.Event) => void;
    onError?: (event: ClipboardJS.Event) => void;
  };
  Blocks: {
    default: [{ triggerId: string }];
  };
}

export default class AkClipboardComponent extends Component<AkClipboardSignature> {
  clipboard: ClipboardJS;

  constructor(owner: unknown, args: AkClipboardSignature['Args']) {
    super(owner, args);

    this.clipboard = new ClipboardJS(`#${this.id}`, this.args.options);

    if (this.args.onSuccess) {
      this.clipboard.on('success', this.args.onSuccess);
    }

    if (this.args.onError) {
      this.clipboard.on('error', this.args.onError);
    }
  }

  willDestroy() {
    super.willDestroy();

    this.clipboard?.destroy();
  }

  get id() {
    return this.args.id || `ak-clipboard-${guidFor(this)}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkClipboard: typeof AkClipboardComponent;
  }
}

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export interface KnoxIqCodeBlockSignature {
  Element: HTMLDivElement;
  Args: {
    code: string;
    maxHeight?: string;
  };
}

export default class KnoxIqCodeBlockComponent extends Component<KnoxIqCodeBlockSignature> {
  @tracked copied = false;

  copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  get copyTargetId() {
    return `knox-iq-code-block-${guidFor(this)}`;
  }

  @action
  handleCopySuccess() {
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }

    this.copied = true;

    this.copyResetTimer = setTimeout(() => {
      this.copied = false;
    }, 2000);
  }

  willDestroy() {
    super.willDestroy();

    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::CodeBlock': typeof KnoxIqCodeBlockComponent;
  }
}

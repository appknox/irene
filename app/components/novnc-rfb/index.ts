import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// @ts-expect-error no types
import RFB from '@novnc/novnc/lib/rfb';

export interface NovncRfbSignature {
  Args: {
    deviceFarmURL: string | null;
    deviceFarmPassword?: string | null;
    allowInteraction?: boolean;
    containCanvas?: boolean;
  };
}

export default class NovncRfbComponent extends Component<NovncRfbSignature> {
  @tracked rfb: any = null;
  connectHandler: ((ev: CustomEvent) => void) | null = null;

  @action
  onDidInsertElement(element: HTMLDivElement) {
    const url = this.args.deviceFarmURL;

    if (!url) {
      return;
    }

    try {
      const password = this.args.deviceFarmPassword;
      const options = password ? { credentials: { password } } : undefined;

      this.rfb = new RFB(element, url, options);
    } catch {
      return;
    }

    const rfb = this.rfb;

    if (!rfb) {
      return;
    }

    rfb.viewOnly = !this.args.allowInteraction;

    // One-shot: scale the viewport once the handshake completes, then
    // self-remove. Tracked on the instance so willDestroy can also remove
    // it if teardown beats the handshake.
    const connectHandler = (this.connectHandler = () => {
      rfb.removeEventListener('connect', connectHandler);

      rfb.scaleViewport = true;
      rfb._display.autoscale(element.offsetWidth, element.offsetHeight);
    });

    rfb.addEventListener('connect', connectHandler);
  }

  @action
  onWillDestroyElement() {
    if (!this.rfb) {
      return;
    }

    // RFB.disconnect() only tears down its internal socket listeners; it
    // does not clear listeners registered via addEventListener. Remove
    // ours explicitly so the handler cannot fire against a destroyed
    // element if the handshake completes mid-teardown.
    if (this.connectHandler) {
      this.rfb.removeEventListener('connect', this.connectHandler);
    }

    try {
      this.rfb.disconnect();
    } catch {
      // already disconnected
    }

    this.rfb = null;
    this.connectHandler = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NovncRfb: typeof NovncRfbComponent;
  }
}

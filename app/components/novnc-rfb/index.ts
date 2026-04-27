import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// @ts-expect-error no types
import RFB from '@novnc/novnc/lib/rfb';

type RfbConnection = {
  viewOnly: boolean;
  scaleViewport: boolean;
  _display: {
    autoscale(width: number, height: number): void;
  };
  addEventListener(type: string, listener: (ev: CustomEvent) => void): void;
  disconnect(): void;
};

export interface NovncRfbSignature {
  Args: {
    deviceFarmURL: string | null;
    deviceFarmPassword?: string | null;
    allowInteraction?: boolean;
    containCanvas?: boolean;
  };
}

export default class NovncRfbComponent extends Component<NovncRfbSignature> {
  @tracked rfb: RfbConnection | null = null;

  @action
  onDidInsertElement(element: HTMLDivElement) {
    const url = this.args.deviceFarmURL;

    if (!url) {
      return;
    }

    try {
      const password = this.args.deviceFarmPassword;
      const options = password ? { credentials: { password } } : undefined;

      this.rfb = new RFB(element, url, options) as RfbConnection;
    } catch {
      return;
    }

    const rfb = this.rfb;

    if (!rfb) {
      return;
    }

    rfb.viewOnly = !this.args.allowInteraction;

    rfb.addEventListener('connect', () => {
      rfb.scaleViewport = true;

      rfb._display.autoscale(element.offsetWidth, element.offsetHeight);
    });
  }

  @action
  onWillDestroyElement() {
    if (this.rfb) {
      try {
        this.rfb.disconnect();
      } catch {
        // already disconnected
      }

      this.rfb = null;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NovncRfb: typeof NovncRfbComponent;
  }
}

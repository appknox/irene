import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// @ts-expect-error no types
import RFB from '@novnc/novnc/lib/rfb';

export interface NovncRfbSignature {
  Args: {
    deviceFarmURL: string | null;
  };
}

export default class NovncRfbComponent extends Component<NovncRfbSignature> {
  @tracked rfb: any = null;

  @action
  onDidInsertElement(element: HTMLDivElement) {
    const url = this.args.deviceFarmURL;

    console.debug('[novnc-rfb] connecting to', url);
    console.debug('[novnc-rfb] RFB import:', RFB);

    if (!url) {
      console.warn('[novnc-rfb] no deviceFarmURL provided, skipping');
      return;
    }

    try {
      this.rfb = new RFB(element, url);
      console.debug('[novnc-rfb] RFB instance created successfully');
    } catch (err) {
      console.error('[novnc-rfb] RFB constructor failed:', err);
      return;
    }

    this.rfb.addEventListener('connect', () => {
      console.debug('[novnc-rfb] connected');

      this.rfb.scaleViewport = true;

      this.rfb._display.autoscale(element.offsetWidth, element.offsetHeight);
    });

    this.rfb.addEventListener('disconnect', (ev: CustomEvent) => {
      console.warn('[novnc-rfb] disconnected, clean:', ev.detail?.clean);
    });

    this.rfb.addEventListener('securityfailure', (ev: CustomEvent) => {
      console.error(
        '[novnc-rfb] security failure:',
        ev.detail?.status,
        ev.detail?.reason
      );
    });
  }

  @action
  onWillDestroyElement() {
    if (this.rfb) {
      console.debug('[novnc-rfb] disconnecting on destroy');

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

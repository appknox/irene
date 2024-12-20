import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// @ts-expect-error no types
import RFB from '@novnc/novnc/lib/rfb';

export interface NovncRfbSignature {
  Args: {
    deviceFarmURL: string | null;
    deviceFarmPassword: string;
  };
}

export default class NovncRfbComponent extends Component<NovncRfbSignature> {
  @tracked rfb: any = null;

  @action
  onDidInsertElement(element: HTMLDivElement) {
    this.rfb = new RFB(element, this.args.deviceFarmURL, {
      credentials: {
        password: this.args.deviceFarmPassword,
      },
    });

    this.rfb.addEventListener('connect', () => {
      const sizing_element = element;

      this.rfb.scaleViewport = true;

      this.rfb._display.autoscale(
        sizing_element.offsetWidth,
        sizing_element.offsetHeight
      );
    });
  }

  @action
  onWillDestroyElement() {
    this.rfb?.removeEventListener('connect', () => {
      this.rfb?.disconnect();

      this.rfb = null;
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NovncRfb: typeof NovncRfbComponent;
  }
}

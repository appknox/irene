import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export interface NovncRfbSignature {
  Args: {
    deviceFarmURL: string | null;
    deviceFarmPassword: string;
  };
}

export default class NovncRfbComponent extends Component<NovncRfbSignature> {
  @tracked rfb: any = null;

  @action
  async onDidInsertElement(element: HTMLDivElement) {
    try {
      // 1. Dynamically import the module and await it (resolves Top-Level Await)
      // @ts-expect-error no types
      const module = await import('@novnc/novnc');
      const RFB = module.default;

      // 2. Ensure we have a URL
      if (!this.args.deviceFarmURL) {
        console.error('No VNC URL provided');
        return;
      }

      // 3. Instantiate RFB inside the async block
      this.rfb = new RFB(element, this.args.deviceFarmURL, {
        credentials: {
          password: this.args.deviceFarmPassword,
        },
      });

      // 4. Setup listeners
      this.rfb.addEventListener('connect', () => {
        this.rfb.scaleViewport = true;

        // Use the display's autoscale feature
        if (this.rfb._display) {
          this.rfb._display.autoscale(
            element.offsetWidth,
            element.offsetHeight
          );
        }
      });
    } catch (e) {
      console.error('Failed to load or initialize noVNC:', e);
    }
  }

  @action
  onWillDestroyElement() {
    if (this.rfb) {
      // Disconnect and cleanup
      this.rfb.disconnect();
      this.rfb = null;
    }
  }
}

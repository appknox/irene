import { modifier } from 'ember-modifier';
import RFB from '@novnc/novnc/lib/rfb';

export interface VncConnectionModifierSignature {
  Element: HTMLDivElement;
  Args: {
    Named: {
      url: string | null;
      password?: string | null;
      allowInteraction?: boolean;
      highQuality?: boolean;
    };
  };
}

// Owns the full noVNC RFB connection lifecycle for an element. The returned
// destructor runs on teardown AND before each re-run, so changing `url`
// (e.g. switching the selected scan / user role) automatically disconnects
// the old socket and reconnects against the new device.
export const vncConnectionModifier = modifier<VncConnectionModifierSignature>(
  (element, _positional, { url, password, allowInteraction, highQuality }) => {
    if (!url) {
      return;
    }

    let rfb: RFB;

    try {
      const options = password ? { credentials: { password } } : undefined;
      rfb = new RFB(element, url, options);
    } catch {
      return;
    }

    rfb.viewOnly = !allowInteraction;

    // noVNC defaults to level 6 of 9, which softens small text on a big preview
    if (highQuality) {
      rfb.qualityLevel = 9;
    }

    // One-shot: scale the viewport once the handshake completes, then
    // self-remove the listener.
    const onConnect = () => {
      rfb.removeEventListener('connect', onConnect);
      rfb.scaleViewport = true;
      rfb._display.autoscale(element.offsetWidth, element.offsetHeight);
    };

    rfb.addEventListener('connect', onConnect);

    return () => {
      // disconnect() only clears RFB's internal socket listeners, not ones
      // registered via addEventListener — remove ours explicitly so it can't
      // fire against a destroyed element if the handshake races teardown.
      rfb.removeEventListener('connect', onConnect);

      try {
        rfb.disconnect();
      } catch {
        // already disconnected
      }
    };
  }
);

export default vncConnectionModifier;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'vnc-connection': typeof vncConnectionModifier;
  }
}

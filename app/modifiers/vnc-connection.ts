import { modifier } from 'ember-modifier';
import { waitForPromise } from '@ember/test-waiters';
import type RFB from '@novnc/novnc/lib/rfb';

export interface VncConnectionModifierSignature {
  Element: HTMLDivElement;
  Args: {
    Named: {
      url: string | null;
      password?: string | null;
      allowInteraction?: boolean;
    };
  };
}

// Owns the full noVNC RFB connection lifecycle for an element. The returned
// destructor runs on teardown AND before each re-run, so changing `url`
// (e.g. switching the selected scan / user role) automatically disconnects
// the old socket and reconnects against the new device.
export const vncConnectionModifier = modifier<VncConnectionModifierSignature>(
  (element, _positional, { url, password, allowInteraction }) => {
    if (!url) {
      return;
    }

    let rfb: RFB | undefined;
    let cancelled = false;

    // One-shot: scale the viewport once the handshake completes, then
    // self-remove the listener.
    const onConnect = () => {
      if (!rfb) {
        return;
      }

      rfb.removeEventListener('connect', onConnect);
      rfb.scaleViewport = true;
      rfb._display.autoscale(element.offsetWidth, element.offsetHeight);
    };

    // noVNC is only needed on the live scan screen, so load it here instead
    // of in the main bundle.
    const connect = async () => {
      const { default: RFBClass } = await import('@novnc/novnc/lib/rfb');

      // torn down (or url changed) while the library was loading
      if (cancelled) {
        return;
      }

      try {
        const options = password ? { credentials: { password } } : undefined;
        rfb = new RFBClass(element, url, options);
      } catch {
        return;
      }

      rfb.viewOnly = !allowInteraction;
      rfb.addEventListener('connect', onConnect);
    };

    void waitForPromise(connect());

    return () => {
      cancelled = true;

      if (!rfb) {
        return;
      }

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

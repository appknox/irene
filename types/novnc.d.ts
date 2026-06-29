/**
 * Type definitions for @novnc/novnc (v1.5.0).
 * Mirrors the public API documented in `@novnc/novnc/docs/API.md`. The package
 * ships no type declarations, so this ambient module makes the untyped
 * `import RFB from '@novnc/novnc/lib/rfb'` resolve with full types.
 */
declare module '@novnc/novnc/lib/rfb' {
  export interface RfbCredentials {
    username?: string;
    password?: string;
    target?: string;
  }

  export interface RfbConstructorOptions {
    shared?: boolean;
    credentials?: RfbCredentials;
    repeaterID?: string;
    wsProtocols?: string[];
  }

  export interface RfbCapabilities {
    power?: boolean;
  }

  /**
   * The RFB object. Extends `EventTarget` for the documented events
   * (`connect`, `disconnect`, `credentialsrequired`, `clipboard`, etc.).
   */
  export default class RFB extends EventTarget {
    constructor(
      target: HTMLElement,
      urlOrChannel: string,
      options?: RfbConstructorOptions
    );

    // ─── Properties ────────────────────────────────────────────────────────
    background: string;
    readonly capabilities: RfbCapabilities;
    clipViewport: boolean;
    readonly clippingViewport: boolean;
    compressionLevel: number;
    dragViewport: boolean;
    focusOnClick: boolean;
    qualityLevel: number;
    resizeSession: boolean;
    scaleViewport: boolean;
    showDotCursor: boolean;
    viewOnly: boolean;

    // ─── Methods ───────────────────────────────────────────────────────────
    approveServer(): void;
    blur(): void;
    clipboardPasteFrom(text: string): void;
    disconnect(): void;
    focus(options?: FocusOptions): void;
    getImageData(): ImageData;
    machineReboot(): void;
    machineReset(): void;
    machineShutdown(): void;
    sendCredentials(credentials: RfbCredentials): void;
    sendCtrlAltDel(): void;
    sendKey(keysym: number | null, code: string, down?: boolean): void;
    toBlob(
      callback: (blob: Blob) => void,
      type?: string,
      quality?: number
    ): void;
    toDataURL(type?: string, quality?: number): string;

    // ─── Internal ──────────────────────────────────────────────────────────
    // Undocumented internal used to autoscale the canvas after connect. Not
    // part of the public API, but relied on by the viewer.
    _display: {
      autoscale(width: number, height: number): void;
    };
  }
}

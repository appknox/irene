/**
 * CyodViewer — browser-side screen viewer for Proxy CYOD scans.
 *
 * Connects to moriarty's ScrcpyBrowserConsumer WebSocket and renders:
 *   Android: H.264 stream via WebCodecs VideoDecoder → canvas
 *   iOS:     MJPEG stream (raw JPEG frames) → drawImage on canvas
 *
 * Touch events on the canvas are sent back as JSON:
 *   { type: "touch", action: "down"|"up"|"move", x: 0..1, y: 0..1 }
 *
 * Usage:
 *   <CyodViewer
 *     @scanToken="..."
 *     @platform={{ENUMS.PLATFORM.ANDROID}}
 *     @authToken="..."
 *   />
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type DevicefarmService from 'irene/services/devicefarm';

const SCRCPY_WS_PATH = '/devicefarm/ws/scrcpy/';

export interface CyodViewerSignature {
  Args: {
    scanToken: string;
    platform: number;
    authToken: string;
  };
  Element: HTMLDivElement;
}

export default class CyodViewerComponent extends Component<CyodViewerSignature> {
  @service declare intl: IntlService;
  @service declare devicefarm: DevicefarmService;

  @tracked isConnected = false;
  @tracked errorMessage: string | null = null;

  private ws: WebSocket | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoDecoder: VideoDecoder | null = null;
  private isPointerDown = false;
  private _spsBuffer: Uint8Array | null = null;
  private _hasReceivedKeyFrame = false;

  get isAndroid() {
    return this.args.platform === ENUMS.PLATFORM.ANDROID;
  }

  get wsUrl() {
    const base = this.devicefarm.urlbase.replace(/^http/, 'ws');
    const url = new URL(
      `${SCRCPY_WS_PATH}${this.args.scanToken}/`,
      base
    );
    url.searchParams.set('token', this.args.authToken);
    return url.href;
  }

  setupCanvas = modifier((canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._connect();

    return () => {
      this._disconnect();
    };
  });

  @action
  handlePointerDown(event: PointerEvent) {
    if (!this.canvas) return;
    this.isPointerDown = true;
    this._sendTouch('down', event);
  }

  @action
  handlePointerMove(event: PointerEvent) {
    if (!this.isPointerDown || !this.canvas) return;
    this._sendTouch('move', event);
  }

  @action
  handlePointerUp(event: PointerEvent) {
    if (!this.canvas) return;
    this.isPointerDown = false;
    this._sendTouch('up', event);
  }

  private _sendTouch(action: string, event: PointerEvent) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.ws.send(JSON.stringify({ type: 'touch', action, x, y }));
  }

  private _connect() {
    if (this.ws) return;
    if (!this.args.scanToken) return;
    this.errorMessage = null;

    this.ws = new WebSocket(this.wsUrl);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      if (this.isDestroyed || this.isDestroying) return;
      this.isConnected = true;
      if (this.isAndroid) {
        this._initH264Decoder();
      }
    };

    this.ws.onclose = () => {
      if (this.isDestroyed || this.isDestroying) return;
      this.isConnected = false;
      this._cleanupDecoder();
    };

    this.ws.onerror = () => {
      if (this.isDestroyed || this.isDestroying) return;
      this.errorMessage = 'Connection failed';
      this.isConnected = false;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(event.data);
        if (this.isAndroid) {
          this._decodeH264Frame(bytes);
        } else {
          this._renderJpegFrame(bytes);
        }
      }
    };
  }

  private _disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._cleanupDecoder();
    this.isConnected = false;
  }

  private _initH264Decoder(codec = 'avc1.42001f') {
    if (!('VideoDecoder' in window)) {
      this.errorMessage = 'WebCodecs not supported — use Chrome 94+';
      return;
    }

    if (this.videoDecoder && this.videoDecoder.state !== 'closed') {
      this.videoDecoder.close();
    }
    this._hasReceivedKeyFrame = false;

    this.videoDecoder = new VideoDecoder({
      output: (frame: VideoFrame) => {
        if (this.ctx && this.canvas) {
          this.canvas.width = frame.displayWidth;
          this.canvas.height = frame.displayHeight;
          this.ctx.drawImage(frame, 0, 0);
        }
        frame.close();
      },
      error: (err: Error) => {
        console.error('[CyodViewer] H.264 decode error:', err);
      },
    });

    this.videoDecoder.configure({ codec, optimizeForLatency: true });
  }

  // Returns true if the Annex-B buffer contains a NAL unit of the given 5-bit type.
  private _hasNalType(bytes: Uint8Array, type: number): boolean {
    for (let i = 0; i < bytes.length - 4; i++) {
      if (
        bytes[i] === 0 &&
        bytes[i + 1] === 0 &&
        bytes[i + 2] === 0 &&
        bytes[i + 3] === 1 &&
        (bytes[i + 4]! & 0x1f) === type
      ) {
        return true;
      }
    }
    return false;
  }

  private _decodeH264Frame(bytes: Uint8Array) {
    if (!this.videoDecoder || this.videoDecoder.state === 'closed') return;
    if (bytes.length <= 4) return;

    const firstNalType = bytes[4]! & 0x1f; // 5-bit NAL unit type
    const isSps = firstNalType === 7;       // NAL 7 = SPS
    // IDR may be preceded by AUD (NAL 9) — scan the whole packet for NAL 5
    const isIdr = firstNalType === 5 || this._hasNalType(bytes, 5);

    if (isSps) {
      // Reconfigure decoder with the codec string extracted from SPS bytes
      if (bytes.length > 7) {
        const profile = bytes[5]!.toString(16).padStart(2, '0');
        const constraints = bytes[6]!.toString(16).padStart(2, '0');
        const level = bytes[7]!.toString(16).padStart(2, '0');
        const codec = `avc1.${profile}${constraints}${level}`;
        this._initH264Decoder(codec);
        const decoder = this.videoDecoder;
        if (!decoder || decoder.state === 'closed') return;
      }
      // Buffer the SPS+PPS packet so we can prepend it to subsequent IDR frames
      this._spsBuffer = bytes;

      // If the same packet also contains an IDR (SPS+PPS+IDR bundle from encoder),
      // decode it immediately — no need to wait for a separate IDR message.
      if (this._hasNalType(bytes, 5)) {
        this._submitVideoChunk(bytes, 'key');
      }
      // Config-only packet: do NOT submit to WebCodecs (it's not a picture frame;
      // submitting SPS/PPS alone causes a decode error and closes the decoder).
      return;
    }

    if (isIdr) {
      // Prepend buffered SPS+PPS so the decoder always sees parameter sets before IDR.
      // Scrcpy sends config and IDR as separate messages; without this the decoder
      // would try to decode an IDR without prior parameter sets and close itself.
      let frameData = bytes;
      if (this._spsBuffer) {
        const combined = new Uint8Array(this._spsBuffer.length + bytes.length);
        combined.set(this._spsBuffer);
        combined.set(bytes, this._spsBuffer.length);
        frameData = combined;
      }
      this._submitVideoChunk(frameData, 'key');
      this._hasReceivedKeyFrame = true;
      return;
    }

    // P/B frame (delta) — drop until we have decoded a key frame
    if (!this._hasReceivedKeyFrame) return;
    this._submitVideoChunk(bytes, 'delta');
  }

  private _submitVideoChunk(bytes: Uint8Array, type: 'key' | 'delta') {
    if (!this.videoDecoder || this.videoDecoder.state === 'closed') return;
    try {
      this.videoDecoder.decode(
        new EncodedVideoChunk({
          type,
          timestamp: performance.now() * 1000,
          data: bytes,
        })
      );
    } catch (err) {
      console.error('[CyodViewer] decode() threw:', err);
    }
  }

  private _renderJpegFrame(bytes: Uint8Array) {
    if (!this.ctx || !this.canvas) return;
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      if (this.canvas && this.ctx) {
        this.canvas.width = img.naturalWidth;
        this.canvas.height = img.naturalHeight;
        this.ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  private _cleanupDecoder() {
    if (this.videoDecoder && this.videoDecoder.state !== 'closed') {
      this.videoDecoder.close();
      this.videoDecoder = null;
    }
    this._spsBuffer = null;
    this._hasReceivedKeyFrame = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    CyodViewer: typeof CyodViewerComponent;
    'cyod-viewer': typeof CyodViewerComponent;
  }
}

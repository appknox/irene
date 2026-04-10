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
    this.errorMessage = null;

    this.ws = new WebSocket(this.wsUrl);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.isConnected = true;
      if (this.isAndroid) {
        this._initH264Decoder();
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this._cleanupDecoder();
    };

    this.ws.onerror = () => {
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

  private _initH264Decoder() {
    if (!('VideoDecoder' in window)) {
      this.errorMessage = 'WebCodecs not supported — use Chrome 94+';
      return;
    }

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

    this.videoDecoder.configure({
      codec: 'avc1.42001f', // H.264 Baseline Level 3.1
      optimizeForLatency: true,
    });
  }

  private _decodeH264Frame(bytes: Uint8Array) {
    if (!this.videoDecoder || this.videoDecoder.state === 'closed') return;

    // Detect keyframe by checking for SPS NAL unit (0x67 or 0x27 start byte after start code)
    const isKey = bytes.length > 4 && (bytes[4] === 0x67 || bytes[4] === 0x27);

    try {
      const chunk = new EncodedVideoChunk({
        type: isKey ? 'key' : 'delta',
        timestamp: performance.now() * 1000,
        data: bytes,
      });
      this.videoDecoder.decode(chunk);
    } catch (err) {
      // Non-fatal — skip malformed frame
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
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    CyodViewer: typeof CyodViewerComponent;
    'cyod-viewer': typeof CyodViewerComponent;
  }
}

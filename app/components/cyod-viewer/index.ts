import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import type IntlService from 'ember-intl/services/intl';

import type DevicefarmService from 'irene/services/devicefarm';
import type LoggerService from 'irene/services/logger';

const SCRCPY_WS_PATH = '/devicefarm/ws/scrcpy/';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 8000;

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
  @service declare logger: LoggerService;

  @tracked isConnected = false;
  @tracked errorMessage: string | null = null;

  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoDecoder: VideoDecoder | null = null;
  private isPointerDown = false;
  private spsBuffer: Uint8Array | null = null;
  private hasReceivedKeyFrame = false;

  get wsUrl() {
    const base = this.devicefarm.urlbase.replace(/^http/, 'ws');
    const url = new URL(`${SCRCPY_WS_PATH}${this.args.scanToken}/`, base);
    url.searchParams.set('token', this.args.authToken);

    return url.href;
  }

  setupCanvas = modifier((canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.connect();

    return () => {
      this.disconnect();
    };
  });

  @action
  handlePointerDown(event: PointerEvent) {
    if (!this.canvas) {
      return;
    }

    this.isPointerDown = true;
    this.sendTouch('down', event);
  }

  @action
  handlePointerMove(event: PointerEvent) {
    if (!this.isPointerDown || !this.canvas) {
      return;
    }

    this.sendTouch('move', event);
  }

  @action
  handlePointerUp(event: PointerEvent) {
    if (!this.canvas) {
      return;
    }

    this.isPointerDown = false;
    this.sendTouch('up', event);
  }

  @action
  handlePointerCancel(event: PointerEvent) {
    if (!this.isPointerDown) {
      return;
    }

    this.isPointerDown = false;
    this.sendTouch('up', event);
  }

  @action
  retry() {
    this.reconnectAttempt = 0;
    this.errorMessage = null;
    this.connect();
  }

  private sendTouch(action: string, event: PointerEvent) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.canvas) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.ws.send(JSON.stringify({ type: 'touch', action, x, y }));
  }

  private connect() {
    if (this.ws) {
      return;
    }
    if (!this.args.scanToken) {
      return;
    }

    this.errorMessage = null;

    let ws: WebSocket;

    // A bad devicefarm URL throws here, on the modifier's install path, which
    // would take the whole render down with it.
    try {
      ws = new WebSocket(this.wsUrl);
    } catch (err) {
      this.logger.error('[CyodViewer] could not open the stream socket:', err);
      this.errorMessage = this.intl.t('cyod.viewer.connectionFailed');

      return;
    }

    ws.binaryType = 'arraybuffer';
    this.ws = ws;

    // A superseded socket keeps firing; without this it reports its own failure
    // over the replacement, leaving the viewer stuck until a page refresh.
    const isCurrent = () =>
      this.ws === ws && !this.isDestroyed && !this.isDestroying;

    ws.onopen = () => {
      if (!isCurrent()) {
        return;
      }
      this.reconnectAttempt = 0;
      this.isConnected = true;
      this.initH264Decoder();
    };

    ws.onclose = () => {
      if (!isCurrent()) {
        return;
      }
      this.isConnected = false;
      this.cleanupDecoder();
      this.ws = null;
      this.scheduleReconnect();
    };

    // onerror is always followed by onclose, which drives the retry; recording
    // the failure here as well would surface an error the retry may clear.
    ws.onerror = () => {
      if (!isCurrent()) {
        return;
      }
      this.isConnected = false;
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!isCurrent()) {
        return;
      }
      if (event.data instanceof ArrayBuffer) {
        this.decodeH264Frame(new Uint8Array(event.data));
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.isDestroyed || this.isDestroying) {
      return;
    }

    if (this.reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
      this.errorMessage = this.intl.t('cyod.viewer.connectionFailed');

      return;
    }

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_DELAY_MS
    );

    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      this.connect();
    }, delay);
  }

  private disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const ws = this.ws;
    this.ws = null;

    if (ws) {
      // Detach before closing: closing a still-connecting socket fires onclose,
      // which would otherwise queue a reconnect for a canvas being torn down.
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.close();
    }

    this.cleanupDecoder();
    this.isConnected = false;
  }

  private initH264Decoder(codec = 'avc1.42001f') {
    if (!('VideoDecoder' in window)) {
      this.errorMessage = this.intl.t('cyod.viewer.unsupportedBrowser');

      return;
    }

    if (this.videoDecoder && this.videoDecoder.state !== 'closed') {
      this.videoDecoder.close();
    }

    this.hasReceivedKeyFrame = false;

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
        this.logger.error('[CyodViewer] H.264 decode error:', err);
      },
    });

    this.videoDecoder.configure({ codec, optimizeForLatency: true });
  }

  private hasNalType(bytes: Uint8Array, type: number): boolean {
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

  private decodeH264Frame(bytes: Uint8Array) {
    if (!this.videoDecoder || this.videoDecoder.state === 'closed') {
      return;
    }
    if (bytes.length <= 4) {
      return;
    }

    const firstNalType = bytes[4]! & 0x1f;
    const isSps = firstNalType === 7;
    const isIdr = firstNalType === 5 || this.hasNalType(bytes, 5);

    if (isSps) {
      if (bytes.length > 7) {
        const profile = bytes[5]!.toString(16).padStart(2, '0');
        const constraints = bytes[6]!.toString(16).padStart(2, '0');
        const level = bytes[7]!.toString(16).padStart(2, '0');
        const codec = `avc1.${profile}${constraints}${level}`;
        this.initH264Decoder(codec);
        const decoder = this.videoDecoder;
        if (!decoder || decoder.state === 'closed') {
          return;
        }
      }
      this.spsBuffer = bytes;

      if (this.hasNalType(bytes, 5)) {
        this.submitVideoChunk(bytes, 'key');
      }

      // Submitting SPS/PPS alone errors the decoder — it is not a picture frame.
      return;
    }

    if (isIdr) {
      // Scrcpy sends config and IDR separately; the decoder needs the parameter
      // sets first, so prepend them.
      let frameData = bytes;
      if (this.spsBuffer) {
        const combined = new Uint8Array(this.spsBuffer.length + bytes.length);
        combined.set(this.spsBuffer);
        combined.set(bytes, this.spsBuffer.length);
        frameData = combined;
      }
      this.submitVideoChunk(frameData, 'key');
      this.hasReceivedKeyFrame = true;

      return;
    }

    if (!this.hasReceivedKeyFrame) {
      return;
    }

    this.submitVideoChunk(bytes, 'delta');
  }

  private submitVideoChunk(bytes: Uint8Array, type: 'key' | 'delta') {
    if (!this.videoDecoder || this.videoDecoder.state === 'closed') {
      return;
    }
    try {
      this.videoDecoder.decode(
        new EncodedVideoChunk({
          type,
          timestamp: performance.now() * 1000,
          data: bytes,
        })
      );
    } catch (err) {
      this.logger.error('[CyodViewer] decode() threw:', err);
    }
  }

  private cleanupDecoder() {
    if (this.videoDecoder && this.videoDecoder.state !== 'closed') {
      this.videoDecoder.close();
      this.videoDecoder = null;
    }

    this.spsBuffer = null;
    this.hasReceivedKeyFrame = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    CyodViewer: typeof CyodViewerComponent;
    'cyod-viewer': typeof CyodViewerComponent;
  }
}

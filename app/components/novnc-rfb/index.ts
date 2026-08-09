import Component from '@glimmer/component';

export interface NovncRfbSignature {
  Args: {
    deviceFarmURL: string | null;
    deviceFarmPassword?: string | null;
    allowInteraction?: boolean;
    containCanvas?: boolean;
  };
}

// The RFB connection lifecycle lives in the `vnc-connection` modifier; this
// component is just the canvas container that hosts it.
export default class NovncRfbComponent extends Component<NovncRfbSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NovncRfb: typeof NovncRfbComponent;
  }
}

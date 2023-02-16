import Component from '@glimmer/component';

interface AkTableSignature {
  Element: HTMLDivElement;
  Args: {
    headerColor?: string;
    variant?: string;
    borderColor?: string;
    hoverable?: boolean;
    dense?: boolean;
  };

  Blocks: {
    // FIXME: Add a better type for yielded block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: any;
  };
}

export default class AkTableComponent extends Component<AkTableSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTable: typeof AkTableComponent;
  }
}

import Component from '@glimmer/component';

interface Info {
  title: string;
  body: string;
  marginTop: string;
}

interface PoweredByAiDrawerSignature {
  Element: HTMLElement;
  Args: {
    aiDrawerOpen: boolean;
    onClose: () => void;
    info?: Info[];
  };
}

export default class PoweredByAiDrawerComponent extends Component<PoweredByAiDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PoweredByAi::Drawer': typeof PoweredByAiDrawerComponent;
  }
}

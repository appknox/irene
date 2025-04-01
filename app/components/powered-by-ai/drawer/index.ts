import { action } from '@ember/object';
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
    showButtons?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
  };
}

export default class PoweredByAiDrawerComponent extends Component<PoweredByAiDrawerSignature> {
  constructor(owner: unknown, args: PoweredByAiDrawerSignature['Args']) {
    super(owner, args);
  }

  @action
  onClick() {
    this.args.onButtonClick?.();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PoweredByAi::Drawer': typeof PoweredByAiDrawerComponent;
  }
}

import { action } from '@ember/object';
import Component from '@glimmer/component';

export interface PoweredByAiDrawerInfo {
  title: string;
  body?: string;
  contentList?: string[];
  marginTop: string;
}

interface PoweredByAiDrawerSignature {
  Element: HTMLElement;
  Args: {
    aiDrawerOpen: boolean;
    onClose: () => void;
    info?: PoweredByAiDrawerInfo[] | null;
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

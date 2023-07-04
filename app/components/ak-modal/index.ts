import Component from '@glimmer/component';
import styles from './index.scss';

export interface AkModalSignature {
  Element: HTMLDivElement;
  Args: {
    showHeader?: boolean;
    headerTitle?: string;
    onClose: () => void;
    onClickOverlay?: () => void;
    disableClose?: boolean;
    disableOverlayClick?: boolean;
    blurOverlay?: boolean;
    noGutter?: boolean;
  };
  Blocks: {
    default: [];
    footer: [];
  };
}

export default class AkModalComponent extends Component<AkModalSignature> {
  noop() {}

  get classes() {
    return {
      overlay: styles['ak-modal-overlay'],
      overlayBlur: styles['ak-modal-overlay-blur'],
      modalDialogContainer: styles['ak-modal-dialog-container'],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkModal: typeof AkModalComponent;
  }
}

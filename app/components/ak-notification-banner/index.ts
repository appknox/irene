import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export interface AkNotificationBannerMessage {
  icon: string;
  color: string;
  message: string;
}

export interface AkAccordionSignature {
  Element: HTMLElement;
  Args: {
    messages: AkNotificationBannerMessage[];
    onClose: () => void;
  };
  Blocks: {
    actionButton: [];
    iconContainer: [];
  };
}

export default class AkNotificationBannerComponent extends Component<AkAccordionSignature> {
  @tracked currentIndex = 0;

  get messages() {
    return this.args.messages;
  }

  get hasMessages() {
    return this.messages?.length > 0;
  }

  get currentMessage() {
    return this.messages[this.currentIndex];
  }

  get isFirstMessage() {
    return this.currentIndex === 0;
  }

  get isLastMessage() {
    return this.currentIndex === this.totalMessages - 1;
  }

  get totalMessages() {
    return this.messages.length;
  }

  get currentMessageNumber() {
    return this.currentIndex + 1;
  }

  get showNextPrev() {
    return this.messages?.length > 1;
  }

  @action
  showPrevMessage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  @action
  showNextMessage() {
    if (this.currentIndex < this.args.messages.length - 1) {
      this.currentIndex++;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkNotificationBanner: typeof AkNotificationBannerComponent;
  }
}

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type { AkStackArgs } from 'irene/components/ak-stack';

export interface ConfirmBoxSignature {
  Element: HTMLElement;
  Args: {
    isActive: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    disabled?: boolean;
    blurOverlay?: boolean;
    justifyActionContent?: AkStackArgs['justifyContent'];
    confirmAction: () => void | Promise<void>;
    cancelAction: () => void | Promise<void>;
    key?: string;
  };
  Blocks: {
    content: [];
  };
}

export default class ConfirmBoxComponent extends Component<ConfirmBoxSignature> {
  @service declare intl: IntlService;

  get justifyActionContent() {
    return this.args.justifyActionContent ?? 'center';
  }

  get blurOverlay() {
    return this.args.blurOverlay ?? false;
  }

  get headerTitle() {
    return this.args.title ?? this.intl.t('confirm');
  }

  get confirmText() {
    return this.args.confirmText ?? this.intl.t('ok');
  }

  get cancelText() {
    return this.args.cancelText ?? this.intl.t('cancel');
  }

  clearModal = task(async () => {
    await this.args.cancelAction();
  });

  sendCallback = task(async () => {
    await this.args.confirmAction();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ConfirmBox: typeof ConfirmBoxComponent;
    'confirm-box': typeof ConfirmBoxComponent;
  }
}

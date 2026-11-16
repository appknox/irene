import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type { AutofixRun } from 'irene/components/knox-iq/autofix-history';
import styles from './index.scss';

export interface KnoxIqAutofixHistoryRunDrawerSignature {
  Element: HTMLElement;
  Args: {
    run: AutofixRun | null;
    onClose: () => void;
  };
}

export default class KnoxIqAutofixHistoryRunDrawerComponent extends Component<KnoxIqAutofixHistoryRunDrawerSignature> {
  @service('browser/document') declare document: Document;

  drawerScroller: HTMLElement | null = null;

  @tracked drawerBodyScrolled = false;

  constructor(
    owner: unknown,
    args: KnoxIqAutofixHistoryRunDrawerSignature['Args']
  ) {
    super(owner, args);

    this.document.addEventListener('keydown', this.handleEscape);
  }

  get isOpen() {
    return Boolean(this.args.run);
  }

  get drawerPanelClass() {
    return styles['drawer-panel'] ?? '';
  }

  @action
  handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.args.run) {
      this.args.onClose();
    }
  }

  @action
  watchDrawerScroll(element: HTMLElement) {
    this.drawerBodyScrolled = false;
    this.drawerScroller = element.parentElement;
    this.drawerScroller?.addEventListener('scroll', this.handleDrawerScroll);
  }

  @action
  unwatchDrawerScroll() {
    this.drawerScroller?.removeEventListener('scroll', this.handleDrawerScroll);
    this.drawerScroller = null;
  }

  @action
  handleDrawerScroll() {
    this.drawerBodyScrolled = (this.drawerScroller?.scrollTop ?? 0) > 0;
  }

  willDestroy(): void {
    super.willDestroy();

    this.document.removeEventListener('keydown', this.handleEscape);
    this.unwatchDrawerScroll();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::AutofixHistory::RunDrawer': typeof KnoxIqAutofixHistoryRunDrawerComponent;
  }
}

import { action } from '@ember/object';
import Component from '@glimmer/component';
import { Select } from 'ember-power-select/components/power-select';
import { later, scheduleOnce } from '@ember/runloop';
import styles from './index.scss';

interface AkSelectBeforeOptionArgs {
  select: Select;
  searchPlaceholder?: string;
  searchEnabled?: boolean;
  extra?: Record<string, unknown>;
  autofocus?: boolean;
  onBlur: (e: FocusEvent) => void;
  onFocus: (e: FocusEvent) => void;
  onInput: (e: InputEvent) => boolean;
  onKeydown: (e: KeyboardEvent) => false | void;
}

export default class AkSelectBeforeOptionComponent extends Component<AkSelectBeforeOptionArgs> {
  get optionTitle() {
    return this.args.extra?.['optionTitle'];
  }

  @action
  clearSearch(): void {
    scheduleOnce('actions', this.args.select.actions, 'search', '');
  }

  @action
  focusInput(el: HTMLElement) {
    later(() => {
      if (this.args.autofocus !== false) {
        el.focus();
      }
    }, 0);
  }

  @action
  handleKeydown(e: KeyboardEvent): false | void {
    if (this.args.onKeydown(e) === false) {
      return false;
    }
    if (e.keyCode === 13) {
      this.args.select.actions.close(e);
    }
  }

  @action
  handleInput(event: Event): false | void {
    const e = event as InputEvent;
    if (this.args.onInput(e) === false) {
      return false;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkSelect::BeforeOption': typeof AkSelectBeforeOptionComponent;
  }
}

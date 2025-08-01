import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { runTask } from 'ember-lifeline';

import type {
  PowerSelectArgs,
  Select,
} from 'ember-power-select/components/power-select';

import styles from './index.scss';
import type { TypographyColors, TypographyVariant } from '../ak-typography';

type AkSelectLabelTypographyVariant = TypographyVariant;
type AkSelectLabelTypographyColor = TypographyColors;

interface AkSelectNamedArgs<O> extends PowerSelectArgs {
  labelId?: string;
  required?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  triggerClass?: string;
  dropdownClass?: string;
  placeholder?: string;
  renderInPlace?: boolean;
  noMatchesMessage?: string;
  error?: boolean;
  loadingMessage?: string;
  labelTypographyVariant?: AkSelectLabelTypographyVariant;
  labelTypographyColor?: AkSelectLabelTypographyColor;
  verticalPosition?: 'above' | 'below' | 'auto';
  options: O[];
  searchPlaceholder?: string;
  searchEnabled?: boolean;
  extra?: Record<string, unknown>;
  optionTitle?: string;
  multiple?: boolean;
  onInput?: (term: string, select: Select, e: Event) => string | false | void;
  onFocus?: (select: Select, event: FocusEvent) => void;
  onBlur?: (select: Select, event: FocusEvent) => void;
}

export interface AkSelectSignature<O> {
  Element: HTMLDivElement;
  Args: AkSelectNamedArgs<O>;
  Blocks: {
    default: [option: O, select?: Select];
  };
}

export default class AkSelectComponent<O> extends Component<
  AkSelectSignature<O>
> {
  get labelId() {
    return this.args.labelId || `ak-select-${guidFor(this)}`;
  }

  get extra() {
    return { ...(this.args.extra || {}), optionTitle: this.args.optionTitle };
  }

  get classes() {
    return {
      dropdown: styles['ak-select-dropdown'],
      trigger: styles['ak-select-trigger'],
      triggerError: styles['ak-select-trigger-error'],
    };
  }

  @action
  onOpen(select: Select, event: Event) {
    // Reposition the dropdown to make sure it's properly aligned
    runTask(this, () => select.actions.reposition());

    this.args.onOpen?.(select, event);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkSelect: typeof AkSelectComponent;
  }
}

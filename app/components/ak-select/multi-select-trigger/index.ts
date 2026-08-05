import Component from '@glimmer/component';
import type { AkIconVariantType } from 'ak-icons';
import type { Select } from 'ember-power-select/components/power-select';

export interface AkSelectMultiSelectTriggerSignature {
  Args: {
    select: Select;
    extra?: Record<string, unknown>;
    tabindex?: string;
  };
  Element: HTMLElement;
}

export default class AkSelectMultiSelectTriggerComponent extends Component<AkSelectMultiSelectTriggerSignature> {
  get filterLabel(): string {
    return String(this.args.extra?.['filterLabel'] ?? '');
  }

  get triggerIcon(): AkIconVariantType {
    const raw = this.args.extra?.['iconName'];

    if (typeof raw === 'string' && raw.length > 0) {
      return raw as AkIconVariantType;
    }

    return 'filter-list';
  }

  get fontSize(): 'small' | 'medium' {
    const s = this.args.extra?.['fontSize'];

    return s === 'medium' ? 'medium' : 'small';
  }

  get labelClass(): string {
    return `trigger-label-${this.fontSize}`;
  }

  get selectedLabels(): string[] {
    const s = this.args.select?.selected;

    if (!Array.isArray(s)) {
      return [];
    }

    return s.filter(
      (x): x is string => typeof x === 'string' && String(x).trim() !== ''
    );
  }

  get selectionSummary(): string {
    const list = this.selectedLabels;

    if (list.length === 0) {
      return '';
    }

    const sorted = [...list].sort((a, b) => a.localeCompare(b));
    const first = sorted[0]!;

    if (list.length === 1) {
      return first;
    }

    return `${first} + ${list.length - 1}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkSelect::MultiSelectTrigger': typeof AkSelectMultiSelectTriggerComponent;
    'ak-select/multi-select-trigger': typeof AkSelectMultiSelectTriggerComponent;
  }
}

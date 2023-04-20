import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { AkIconColorVariant } from 'irene/components/ak-icon';
import {
  TypographyColors,
  TypographyVariant,
  TypographyFontWeight,
} from '../ak-typography';

export type AkAccordionVariant = 'primary' | 'secondary';
export type AkAccordionTypographyVariant = TypographyVariant;
export type AkAccordionFontWeightVariant = TypographyFontWeight;

interface CustomsummaryAPI {
  onSummaryClick: () => void;
  disabled: boolean;
  isExpanded: boolean;
}

export interface AkAccordionSignature {
  Element: HTMLElement;
  Args: {
    id?: string;
    disabled?: boolean;
    isExpanded?: boolean;
    summaryText?: string;
    summaryTextVariant?: AkAccordionTypographyVariant;
    summaryTextFontWeight?: AkAccordionFontWeightVariant;
    summaryIconName?: string;
    variant?: AkAccordionVariant;
    customSumaryClass?: string;
    onChange?: (id: string, isExpanded: boolean) => void;
  };
  Blocks: {
    default: [];
    summary: [CustomsummaryAPI];
    summaryText: [];
    summaryIcon: [];
    content: [];
  };
}

export default class AkAccordionComponent extends Component<AkAccordionSignature> {
  @tracked content: HTMLDivElement | null = null;
  @tracked isExpanded = false;

  summaryColorVariantMap = {
    primary: 'primary',
    secondary: 'textPrimary',
  };

  constructor(owner: unknown, args: AkAccordionSignature['Args']) {
    super(owner, args);
    this.isExpanded = !!this.args.isExpanded;
  }

  get id() {
    return this.args.id || `ak-checkbox-${guidFor(this)}`;
  }

  get variant() {
    return this.args.variant || 'secondary';
  }

  get isDisabled() {
    return !!this.args.disabled;
  }

  get summaryColorVariant(): TypographyColors {
    if (this.isDisabled) {
      return 'textSecondary';
    }

    return this.summaryColorVariantMap[this.variant] as TypographyColors;
  }

  get summaryIconColorVariant() {
    if (this.isDisabled) {
      return 'textSecondary';
    }

    return this.summaryColorVariantMap[this.variant] as AkIconColorVariant;
  }

  get expandAccordion() {
    return this.isExpanded && !this.isDisabled;
  }

  @action
  onSummaryClick() {
    if (this.isDisabled) {
      return;
    }

    this.toggleContentExpanded();

    if (this.args.onChange) {
      this.args.onChange(this.id, this.isExpanded);
    }
  }

  @action
  toggleContentExpanded() {
    this.isExpanded = !this.isExpanded;

    if (this.content && !this.isExpanded) {
      this.content.style.maxHeight = '0px';

      return;
    }

    this.setContentElementHeight();
  }

  @action
  contentInserted(element: HTMLDivElement) {
    this.content = element;

    if (!this.isExpanded) {
      this.content.style.maxHeight = '0px';
    } else {
      this.setContentElementHeight();
    }
  }

  @action
  setContentElementHeight() {
    const content = this.content;

    if (content) {
      // Necessary for components with dynamic heights
      // For instance tables which load data gradually or whose limts can be changed.
      // This is also to ensure a smooth transition when closing and opening the accordion content
      const observer = new ResizeObserver(() => {
        if (this.isExpanded) {
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      });

      // Observes the sizes of all children and updates the height of the content element accordingly
      for (let i = 0; i < content.children.length; i++) {
        const element = content.children[i];

        if (element) {
          observer.observe(element);
        }
      }
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkAccordion: typeof AkAccordionComponent;
  }
}

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
import { AccordionCtxProps } from './group';

export type AkAccordionVariant = 'primary' | 'secondary' | 'light';
export type AkAccordionTypographyVariant = TypographyVariant;
export type AkAccordionFontWeightVariant = TypographyFontWeight;

export interface CustomsummaryAPI {
  onSummaryClick: () => void;
  disabled: boolean;
  isExpanded: boolean;
}

export interface AkAccordionSignature {
  Element: HTMLElement;
  Args: {
    id?: string;
    accordionCtx?: AccordionCtxProps;
    disabled?: boolean;
    isExpanded?: boolean;
    summaryText?: string;
    summaryTextVariant?: AkAccordionTypographyVariant;
    summaryTextFontWeight?: AkAccordionFontWeightVariant;
    summaryIconName?: string;
    variant?: AkAccordionVariant;
    customSumaryClass?: string;
    mountContentOnExpand?: boolean;
    unmountContentOnCollapse?: boolean;
    onChange?: (id: string, isExpanded?: boolean) => void;
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
  @tracked hasRenderedContent = false;

  summaryColorVariantMap = {
    primary: 'primary',
    secondary: 'textPrimary',
    light: 'textPrimary',
  };

  constructor(owner: unknown, args: AkAccordionSignature['Args']) {
    super(owner, args);

    // Sets content rendered state to true if accordion is expanded by default and mountContentOnExpand is true
    if (this.isExpanded && this.args.mountContentOnExpand) {
      this.hasRenderedContent = true;
    }

    // For standalone accordions, the expanded state must be provided
    if (!this.accordionCtx && this.isExpanded === undefined) {
      throw new Error(
        'You must provide an open state for standalone accordions.'
      );
    }
  }

  get id() {
    return this.args.id || `ak-accordion-${guidFor(this)}`;
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

  get accordionCtx() {
    return this.args.accordionCtx;
  }

  get isExpanded() {
    // For accordion groups where a multiple accordions can be open
    if (this.accordionCtx?.openMultiple) {
      return !!this.accordionCtx.accordionOpenStates[this.id];
    }

    // For accordion groups where just a single accordion can be open at a time
    if (this.accordionCtx) {
      return this.accordionCtx.currentOpenId === this.id;
    }

    // For standalone accordions
    return this.args.isExpanded;
  }

  get mountContentOnExpand() {
    return this.args.mountContentOnExpand;
  }

  get unmountContentOnCollapse() {
    return this.args.unmountContentOnCollapse;
  }

  get expandAccordion() {
    return this.isExpanded && !this.isDisabled;
  }

  get displayContent() {
    // Hides content always after collapse even when mountContentOnExpand is true
    if (this.unmountContentOnCollapse && !this.isExpanded) {
      return false;
    }

    // Displays content always after first mount when mountContentOnExpand is true
    if (this.mountContentOnExpand && this.hasRenderedContent) {
      return true;
    }

    // Necessary to pevent content from displaying initially when accordion is collaped when mountContentOnExpand is true
    if (this.mountContentOnExpand) {
      return this.isExpanded;
    }

    return true;
  }

  @action
  onSummaryClick() {
    if (this.isDisabled) {
      return;
    }

    // For grouped accordions
    this.accordionCtx?.handleChange(this.id);

    if (this.args.onChange) {
      this.args.onChange(this.id);
    }

    this.resolveRenderedContentState();
  }

  @action
  resolveRenderedContentState() {
    // Renders content only once when content is mounted
    if (this.mountContentOnExpand && !this.hasRenderedContent) {
      this.hasRenderedContent = true;
    }

    // Unmounts content on collape if unmountContentOnCollapse is true
    if (this.unmountContentOnCollapse && !this.isExpanded) {
      this.hasRenderedContent = false;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkAccordion: typeof AkAccordionComponent;
  }
}

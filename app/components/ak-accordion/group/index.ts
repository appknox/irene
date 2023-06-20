import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export interface AccordionCtxProps {
  currentOpenId: string;
  openMultiple?: boolean;
  handleChange: (id: string) => void;
  accordionOpenStates: Record<string, boolean>;
}

export interface AkAccordionGroupSignature {
  Element: HTMLElement;
  Args: {
    onChange?: (id: string) => void;

    /**
     * @param {Array<string>} [defaultOpen]
     * @description Specifies default open accordion(s)
     */
    defaultOpen?: Array<string>;

    /**
     * @param {boolean} [openMultiple]
     * @description Specifies whether an accordion group should open multiple accordions at the same time
     */
    openMultiple?: boolean;
  };
  Blocks: {
    default: [AccordionCtxProps];
  };
}

export default class AkAccordionGroupComponent extends Component<AkAccordionGroupSignature> {
  @tracked currentOpenId = '';
  @tracked accordionOpenStates: Record<string, boolean> = {};

  constructor(owner: unknown, args: AkAccordionGroupSignature['Args']) {
    super(owner, args);

    if (!this.args.openMultiple && this.args.defaultOpen) {
      this.currentOpenId = this.args.defaultOpen[0] || '';
    }

    if (this.args.openMultiple && this.args.defaultOpen?.length) {
      this.accordionOpenStates = this.args.defaultOpen.reduce(
        (acc, curr) => ({ ...acc, [curr]: true }),
        this.accordionOpenStates
      );
    }
  }

  @action
  handleChange(id: string) {
    this.args.onChange?.(id);

    // Toggles open states for accordion groups where multiple accordions can be open at the same time
    if (this.args.openMultiple) {
      this.accordionOpenStates = {
        ...this.accordionOpenStates,
        [id]: this.accordionOpenStates[id]
          ? !this.accordionOpenStates[id]
          : true,
      };

      return;
    }

    // Resets the current active accordion state in groups where only one accordions can be open at once
    if (id === this.currentOpenId) {
      this.currentOpenId = '';

      return;
    }

    // Sets the current active accordion in groups where only one accordions can be open at once
    this.currentOpenId = id;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkAccordion::Group': typeof AkAccordionGroupComponent;
  }
}

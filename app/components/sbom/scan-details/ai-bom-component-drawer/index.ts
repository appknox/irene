import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

interface DrawerField {
  label: string;
  value: string | null;
  isLink?: boolean;
  isExpandable?: boolean;
}

// Show More only hides locations after the first 4, which remain visible by default.
const VISIBLE_FOUND_IN_COUNT = 4;

export interface AiBomComponentDrawerSignature {
  Element: HTMLDivElement;
  Args: {
    component: SbomComponentModel | null;
    open: boolean;
    onClose: () => void;
  };
}

export default class AiBomComponentDrawerComponent extends Component<AiBomComponentDrawerSignature> {
  @service declare intl: IntlService;

  @tracked isFoundInExpanded = false;

  get componentName() {
    return this.args.component?.name || '-';
  }

  get componentType() {
    return this.args.component?.aiTypeLabel ?? '-';
  }

  get foundInLocations() {
    return this.args.component?.evidenceLocations ?? [];
  }

  get hasMultipleFoundInLocations() {
    return this.foundInLocations.length > 1;
  }

  get hasHiddenFoundInLocations() {
    return this.foundInLocations.length > VISIBLE_FOUND_IN_COUNT;
  }

  // Locations 2-4 (indices 1-3) -- always visible alongside the first row.
  get alwaysVisibleFoundInLocations() {
    return this.foundInLocations.slice(1, VISIBLE_FOUND_IN_COUNT);
  }

  // Location 5 onward -- only rendered once expanded.
  get additionalFoundInLocations() {
    return this.foundInLocations.slice(VISIBLE_FOUND_IN_COUNT);
  }

  get firstFoundInLocation() {
    return this.foundInLocations[0] ?? null;
  }

  get foundInValue() {
    return this.args.component?.hasFoundLocations
      ? this.firstFoundInLocation
      : null;
  }

  get referenceLink() {
    const link = this.args.component?.primaryLink;

    return link && link !== '-' ? link : null;
  }

  get familyValue() {
    const family = this.args.component?.aiFamily;

    return family && family !== '-' ? family : null;
  }

  get purposeValue() {
    return this.args.component?.aiPurposeDisplay || null;
  }

  get associatedModelValue() {
    return this.args.component?.aiAssociatedModelPath || null;
  }

  get drawerFields(): DrawerField[] {
    return [
      {
        label: this.intl.t('sbomModule.componentType'),
        value: this.componentType,
      },
      {
        label: this.intl.t('sbomModule.foundInLocations'),
        value: this.foundInValue,
        isExpandable: this.hasMultipleFoundInLocations,
      },
      {
        label: this.intl.t('sbomModule.referenceLink'),
        value: this.referenceLink,
        isLink: true,
      },
      {
        label: this.intl.t('sbomModule.aiFamilyColumn'),
        value: this.familyValue,
      },
      {
        label: this.intl.t('sbomModule.aiPurposeColumn'),
        value: this.purposeValue,
      },
      {
        label: this.intl.t('sbomModule.aiAssociatedModel'),
        value: this.associatedModelValue,
      },
    ].filter((field) => field.value !== null) as DrawerField[];
  }

  @action toggleFoundInExpanded() {
    this.isFoundInExpanded = !this.isFoundInExpanded;
  }

  @action handleClose() {
    this.isFoundInExpanded = false;

    this.args.onClose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::AiBomComponentDrawer': typeof AiBomComponentDrawerComponent;
  }
}

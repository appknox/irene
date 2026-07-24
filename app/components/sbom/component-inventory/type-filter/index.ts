import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS, { ENUMS_DISPLAY } from 'irene/enums';

const TYPE_NAMES = ENUMS_DISPLAY.SBOM_COMPONENT_TYPE_NAMES;

export interface SbomComponentInventoryTypeFilterSignature {
  Element: HTMLDivElement;
  Args: {
    selectedComponentType?: string;
    onComponentTypeChange: (componentType: string) => void;
  };
}

export default class SbomComponentInventoryTypeFilterComponent extends Component<SbomComponentInventoryTypeFilterSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get typeOptions() {
    return [
      { key: this.intl.t('all'), value: '' },
      {
        key: this.intl.t('framework'),
        value: TYPE_NAMES[ENUMS.SBOM_COMPONENT_TYPE.FRAMEWORK],
      },
      {
        key: this.intl.t('library'),
        value: TYPE_NAMES[ENUMS.SBOM_COMPONENT_TYPE.LIBRARY],
      },
      {
        key: this.intl.t('file'),
        value: TYPE_NAMES[ENUMS.SBOM_COMPONENT_TYPE.FILE],
      },
      {
        key: this.intl.t('sbomModule.mlModel'),
        value: TYPE_NAMES[ENUMS.SBOM_COMPONENT_TYPE.MACHINE_LEARNING_MODEL],
      },
    ];
  }

  get selectedComponentType() {
    return this.args.selectedComponentType || '';
  }

  get filterApplied() {
    return Boolean(this.selectedComponentType);
  }

  get triggerLabel() {
    const selected = this.typeOptions.find(
      (option) => option.value === this.selectedComponentType
    );

    return this.filterApplied && selected
      ? selected.key
      : this.intl.t('sbomModule.componentType');
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectComponentType(value: string) {
    this.anchorRef = null;

    this.args.onComponentTypeChange(value);
  }

  @action clearFilter() {
    this.anchorRef = null;

    this.args.onComponentTypeChange('');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory::TypeFilter': typeof SbomComponentInventoryTypeFilterComponent;
  }
}

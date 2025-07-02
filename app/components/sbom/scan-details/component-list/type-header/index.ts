import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

interface FileDetailsDynamicScanResultsCoverageTableComponentTypeHeaderSignature {
  Args: {
    onComponentTypeChange: (type: number) => void;
    selectedComponentType?: number;
  };
}

export default class FileDetailsDynamicScanResultsCoverageTableComponentTypeHeaderComponent extends Component<FileDetailsDynamicScanResultsCoverageTableComponentTypeHeaderSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get typeOptions() {
    return [
      { key: this.intl.t('all'), value: -1 },
      {
        key: this.intl.t('framework'),
        value: ENUMS.SBOM_COMPONENT_TYPE.FRAMEWORK,
      },
      {
        key: this.intl.t('library'),
        value: ENUMS.SBOM_COMPONENT_TYPE.LIBRARY,
      },
      {
        key: this.intl.t('file'),
        value: ENUMS.SBOM_COMPONENT_TYPE.FILE,
      },
      {
        key: this.intl.t('sbomModule.mlModel'),
        value: ENUMS.SBOM_COMPONENT_TYPE.MACHINE_LEARNING_MODEL,
      },
    ];
  }

  get selectedComponentType() {
    return Number(this.args.selectedComponentType);
  }

  get filterApplied() {
    return Number(this.selectedComponentType) > -1;
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectComponentType(value: number) {
    this.anchorRef = null;

    this.args.onComponentTypeChange(value);
  }

  @action clearFilter() {
    this.anchorRef = null;

    this.args.onComponentTypeChange(-1);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::CoverageTable::ComponentTypeHeader': typeof FileDetailsDynamicScanResultsCoverageTableComponentTypeHeaderComponent;
  }
}

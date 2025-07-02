import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';

interface SbomScanDetailsComponentListDependencyTypeHeaderComponentSignature {
  Args: {
    onDependencyTypeChange: (type: boolean | null) => void;
    selectedDependencyType?: boolean | string | null;
  };
}

export default class SbomScanDetailsComponentListDependencyTypeHeaderComponent extends Component<SbomScanDetailsComponentListDependencyTypeHeaderComponentSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get typeOptions() {
    return [
      { key: this.intl.t('all'), value: null },
      {
        key: this.intl.t('dependencyTypes.direct'),
        value: false,
      },
      {
        key: this.intl.t('dependencyTypes.transitive'),
        value: true,
      },
    ];
  }

  get selectedDependencyType() {
    const depType = this.args.selectedDependencyType;

    return depType === null ? null : depType;
  }

  get filterApplied() {
    return this.selectedDependencyType !== null;
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectDependencyType(value: boolean | null) {
    this.anchorRef = null;

    this.args.onDependencyTypeChange(value);
  }

  @action clearFilter() {
    this.anchorRef = null;

    this.args.onDependencyTypeChange(null);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::DependencyTypeHeader': typeof SbomScanDetailsComponentListDependencyTypeHeaderComponent;
  }
}

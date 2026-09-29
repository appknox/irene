import Model, { attr } from '@ember-data/model';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import type IntlService from 'ember-intl/services/intl';

import ENUMS, { ENUMS_DISPLAY } from 'irene/enums';

type SbomComponentInventoryStatus = 'VULNERABLE' | 'SECURE';

export default class SbomComponentInventoryModel extends Model {
  @service declare intl: IntlService;

  @attr('string')
  declare name: string;

  @attr('string')
  declare componentName: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare componentType: string;

  @attr('string')
  declare purlType: string;

  @attr('string')
  declare namespace: string;

  @attr('string')
  declare bomRef: string;

  @attr('string')
  declare latestVersion: string;

  @attr('string')
  declare status: SbomComponentInventoryStatus;

  get displayName() {
    return this.componentName || this.bomRef || this.name || '-';
  }

  get hasVersion() {
    return Boolean(this.version?.trim());
  }

  get displayVersion() {
    return this.hasVersion ? this.version : '-';
  }

  get cleanVersion() {
    return (this.version || '').trim().replace(/(^")|("$)/g, '');
  }

  get cleanLatestVersion() {
    return (this.latestVersion || '').trim().replace(/(^")|("$)/g, '');
  }

  get isMLModel() {
    return (
      this.componentType ===
      ENUMS_DISPLAY.SBOM_COMPONENT_TYPE_NAMES[
        ENUMS.SBOM_COMPONENT_TYPE.MACHINE_LEARNING_MODEL
      ]
    );
  }

  get typeLabel() {
    if (!this.componentType) {
      return '-';
    }

    if (this.isMLModel) {
      return this.intl.t('sbomModule.mlModel');
    }

    return capitalize(this.componentType);
  }

  get isVulnerable() {
    return this.status === 'VULNERABLE';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-component-inventory': SbomComponentInventoryModel;
  }
}
